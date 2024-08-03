const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const session = require('express-session');
const MySQLStore = require('connect-mysql')(session);
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 80;

// Database connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '123',
    database: 'PlateShare'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

// Stores the current session
const sessionStore = new MySQLStore({
    config: {
        user: 'root',
        password: '123',
        database: 'PlateShare'
    }
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'your_secret_key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Routes for the different HTML pages
app.get('/welcome', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'SignInUP.html'));
});

app.get('/home', (req, res) => {
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, 'public', 'Home.html'));
    } else {
        res.redirect('/welcome');
    }
});

app.get('/newpost', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'NewPost.html'));
});

app.get('/accountsettings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Account_Settings.html'));
});

app.get('/recipe', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Recipe.html'));
});

app.get('/step1', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'FP_Step1.html'));
});

app.get('/step2', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'FP_Step2.html'));
});

app.get('/step3', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'FP_Step3.html'));
});

app.get('/step4', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'FP_Step4.html'));
});

// Default route to welcome
app.get('/', (req, res) => {
    res.redirect('/welcome');
});

// Handle signup form submission
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Hash (encrpyts) the password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert new user into the database
        const query = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
        db.query(query, [username, email, password_hash], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send('Username or Email already exists');
                }
                throw err;
            }
            res.send('User registered successfully');
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Handle signin form submission
app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            res.status(500).send('Server error');
        } else if (results.length === 0) {
            res.status(400).send('Invalid email or password');
        } else {
            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.password_hash);

            if (passwordMatch) {
                req.session.userId = user.user_id;
                res.redirect('/home');
            } else {
                res.status(400).send('Invalid email or password');
            }
        }
    });
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Server error');
        }
        res.redirect('/welcome');
    });
});

// Handle new recipe form submission
app.post('/submitrecipe', upload.single('photo'), (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('You must be logged in to submit a recipe.');
    }

    const userId = req.session.userId;
    const { prepTime, cookTime, servingSize, difficulty, ingredients: rawIngredients, steps: rawSteps } = req.body;
    let photoPath = req.file.path;

    photoPath = photoPath.replace('public/', '');

    const ingredients = Array.isArray(rawIngredients) ? rawIngredients : [rawIngredients];
    const steps = Array.isArray(rawSteps) ? rawSteps : [rawSteps];

    const insertRecipeQuery = `INSERT INTO recipes (userId, prepTime, cookTime, servingSize, difficulty, photoPath) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(insertRecipeQuery, [userId, prepTime, cookTime, servingSize, difficulty, photoPath], (err, result) => {
        if (err) {
            res.status(500).send('Server error');
            return;
        }

        const recipeId = result.insertId;

        const insertIngredientQuery = `INSERT INTO ingredients (recipeId, quantityAmount, quantityType, ingredientDescription) VALUES ?`;
        const ingredientValues = ingredients.map(ingredient => [recipeId, ingredient.quantityAmount, ingredient.quantityType, ingredient.ingredientDescription]);

        db.query(insertIngredientQuery, [ingredientValues], (err, result) => {
            if (err) {
                res.status(500).send('Server error');
                return;
            }

            const insertStepQuery = `INSERT INTO steps (recipeId, stepDescription) VALUES ?`;
            const stepValues = steps.map(step => [recipeId, step]);

            db.query(insertStepQuery, [stepValues], (err, result) => {
                if (err) {
                    res.status(500).send('Server error');
                    return;
                }

                res.sendFile(path.join(__dirname, 'public', 'PostSuccess.html'));
            });
        });
    });
});

app.get('/api/posts', (req, res) => {
    const query = `
        SELECT r.id AS recipeId, r.photoPath AS image_url, u.username, u.user_photo AS user_profile_pic, 0 AS rating
        FROM recipes r
        JOIN users u ON r.userId = u.user_id
        ORDER BY r.id DESC
        LIMIT 5;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching posts:', err);
            res.status(500).send('Error fetching posts');
            return;
        }
        res.json(results);
    });
});

// Route to fetch recipe details using the id
app.get('/api/test-recipe/:recipeId', (req, res) => {
    const recipeId = req.params.recipeId;

    const query = `
        SELECT r.*, u.username 
        FROM recipes r
        JOIN users u ON r.userId = u.user_id
        WHERE r.id = ?;
    `;
    
    db.query(query, [recipeId], (err, results) => {
        if (err) {
            console.error('Error fetching recipe:', err);
            res.status(500).send('Error fetching recipe');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Recipe not found');
            return;
        }

        const recipe = results[0];

        const ingredientsQuery = `
            SELECT *
            FROM ingredients
            WHERE recipeId = ?;
        `;

        const stepsQuery = `
            SELECT *
            FROM steps
            WHERE recipeId = ?;
        `;

        db.query(ingredientsQuery, [recipeId], (err, ingredients) => {
            if (err) {
                console.error('Error fetching ingredients:', err);
                res.status(500).send('Error fetching recipe');
                return;
            }

            db.query(stepsQuery, [recipeId], (err, steps) => {
                if (err) {
                    console.error('Error fetching steps:', err);
                    res.status(500).send('Error fetching recipe');
                    return;
                }

                res.json({ recipe, ingredients, steps });
            });
        });
    });
});

// Handle profile photo upload
app.post('/uploadProfilePhoto', upload.single('profile-photo-input'), (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('You must be logged in to update your profile photo.');
    }

    const userId = req.session.userId;
    let photoPath = req.file.path;
    photoPath = photoPath.replace('public/', '');

    const updatePhotoQuery = `UPDATE users SET user_photo = ? WHERE user_id = ?`;
    db.query(updatePhotoQuery, [photoPath, userId], (err, result) => {
        if (err) {
            res.status(500).send('Server error');
            return;
        }
        res.send('Profile photo updated successfully');
    });
});

// Handles updating user information (username, email, password)
app.post('/updateUserInfo', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('You must be logged in to update your information.');
    }

    const userId = req.session.userId;
    const { newUsername, newEmail, newPassword } = req.body;

    try {
        let updateQuery = '';
        const queryParams = [];

        if (newUsername) {
            updateQuery += 'UPDATE users SET username = ? WHERE user_id = ?; ';
            queryParams.push(newUsername, userId);
        }

        if (newEmail) {
            updateQuery += 'UPDATE users SET email = ? WHERE user_id = ?; ';
            queryParams.push(newEmail, userId);
        }

        if (newPassword) {
            const passwordHash = await bcrypt.hash(newPassword, 10);
            updateQuery += 'UPDATE users SET password_hash = ? WHERE user_id = ?; ';
            queryParams.push(passwordHash, userId);
        }

        db.query(updateQuery, queryParams, (err, result) => {
            if (err) {
                res.status(500).send('Server error');
                return;
            }
            res.send('User information updated successfully');
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Handles deleting a users account
app.post('/deleteAccount', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('You must be logged in to delete your account.');
    }

    const userId = req.session.userId;

    const deleteQuery = 'DELETE FROM users WHERE user_id = ?';
    db.query(deleteQuery, [userId], (err, result) => {
        if (err) {
            res.status(500).send('Server error');
            return;
        }

        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send('Server error');
            }
            res.send('Account deleted successfully');
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
