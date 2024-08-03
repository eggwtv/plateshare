document.addEventListener('DOMContentLoaded', () => {
    const addIngredientButton = document.querySelector('.add-ingredient');
    const ingredientsContainer = document.getElementById('ingredients');
    const addStepButton = document.querySelector('.add-step');
    const stepsContainer = document.getElementById('steps');

    addIngredientButton.addEventListener('click', () => {
        const ingredientCount = ingredientsContainer.querySelectorAll('.ingredient').length + 1;
        const newIngredient = document.createElement('div');
        newIngredient.classList.add('ingredient');
        newIngredient.innerHTML = `
            <label>${ingredientCount}</label>
            <input type="number" name="ingredients[${ingredientCount - 1}][quantityAmount]" placeholder="Amount">
            <select name="ingredients[${ingredientCount - 1}][quantityType]">
                <option value="Grams">Grams</option>
                <option value="Kilograms">Kilograms</option>
                <option value="Pounds">Pounds</option>
                <option value="Millilitres">Millilitres</option>
                <option value="Litres">Litres</option>
                <option value="Ounces">Ounces</option>
                <option value="Teaspoons">Teaspoons</option>
                <option value="Tablespoons">Tablespoons</option>
                <option value="Cups">Cups</option>
                <option value="Pints">Pints</option>
                <option value="Quarts">Quarts</option>
            </select>
            <input type="text" name="ingredients[${ingredientCount - 1}][ingredientDescription]" placeholder="Ingredient">
        `;
        ingredientsContainer.appendChild(newIngredient);
    });

    addStepButton.addEventListener('click', () => {
        const stepCount = stepsContainer.querySelectorAll('.step').length + 1;
        const newStep = document.createElement('div');
        newStep.classList.add('step');
        newStep.innerHTML = `
            <label>${stepCount}</label>
            <input type="text" name="steps[]" placeholder="Step description">
        `;
        stepsContainer.appendChild(newStep);
    });
});

// Function to handle the form submission
function handleFormSubmit(event) {
    event.preventDefault();

    const title = document.getElementById('post-title').value;
    const imageUrl = document.getElementById('post-image-url').value;
    const username = document.getElementById('post-username').value;
    const userProfilePic = document.getElementById('post-user-profile-pic').value;

    const postData = {
        title,
        imageUrl,
        username,
        userProfilePic
    };

    fetch('/api/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        window.location.href = '/post-uploaded.html';
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

document.getElementById('new-post-form').addEventListener('submit', handleFormSubmit);


function toggleMenu() {
    var menu = document.getElementById('menu');
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'flex';
    } else {
        menu.style.display = 'none';
    }
}

