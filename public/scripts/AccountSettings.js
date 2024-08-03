function toggleMenu() {
    var menu = document.getElementById('menu');
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'flex';
    } else {
        menu.style.display = 'none';
    }
}

// Function to handle file input change
document.getElementById('profile-photo-input').addEventListener('change', function(event) {
    const selectedFile = event.target.files[0];
    const selectedFileName = selectedFile ? selectedFile.name : 'No file selected';
    document.getElementById('selected-file-name').textContent = `Selected file: ${selectedFileName}`;
    document.getElementById('upload-photo-btn').style.display = 'block';
});

// Function to handle upload button click
document.getElementById('upload-photo-btn').addEventListener('click', function() {
    const formData = new FormData();
    const fileInput = document.getElementById('profile-photo-input');
    formData.append('profilePhoto', fileInput.files[0]);

    fetch('/upload-profile-photo', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Profile photo uploaded:', data.filePath);
        updateProfilePhoto(data.filePath);
    })
    .catch(error => {
        console.error('Error uploading profile photo:', error);
    });
});

// Function to update profile photo path in user table
function updateProfilePhoto(filePath) {
    fetch('/update-profile-photo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filePath })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Profile photo path updated in user table:', data.message);
    })
    .catch(error => {
        console.error('Error updating profile photo path:', error);
    });
}

// Function to update username
function updateUsername() {
    const newUsername = document.getElementById('new-username').value;

    fetch('/update-username', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newUsername })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Username updated:', data.message);
    })
    .catch(error => {
        console.error('Error updating username:', error);
    });
}

// Function to update email
function updateEmail() {
    const newEmail = document.getElementById('new-email').value;

    fetch('/update-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newEmail })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Email updated:', data.message);
    })
    .catch(error => {
        console.error('Error updating email:', error);
    });
}

// Function to update password
function updatePassword() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        console.error('Passwords do not match');
        return;
    }

    fetch('/update-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Password updated:', data.message);
    })
    .catch(error => {
        console.error('Error updating password:', error);
    });
}

// Function to delete account
function deleteAccount() {
    if (!confirm('Are you sure you want to delete your account?')) {
        return;
    }

    fetch('/delete-account', {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Account deleted:', data.message);
        window.location.href = '/welcome';
    })
    .catch(error => {
        console.error('Error deleting account:', error);
    });
}
