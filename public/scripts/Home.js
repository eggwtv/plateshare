// Function to toggle menu
function toggleMenu() {
    var menu = document.getElementById('menu');
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'flex';
    } else {
        menu.style.display = 'none';
    }
}

// Function to fetch and display posts
function fetchPosts() {
    fetch('/api/posts')
    .then(response => response.json())
    .then(posts => {
        const postsContainer = document.getElementById('posts-container');
        postsContainer.innerHTML = '';

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('recipe');

            const imageLink = document.createElement('a');
            imageLink.href = `/recipe?id=${post.recipeId}`;

            const postImage = document.createElement('img');
            postImage.src = post.image_url;
            postImage.alt = post.title;

            imageLink.appendChild(postImage);
            postElement.appendChild(imageLink);

            const infoContainer = document.createElement('div');
            infoContainer.classList.add('info');

            const userDiv = document.createElement('div');
            userDiv.classList.add('user');

            const userImage = document.createElement('img');
            userImage.src = post.user_profile_pic;
            userImage.alt = post.username;

            const usernameSpan = document.createElement('span');
            usernameSpan.textContent = post.username;

            userDiv.appendChild(userImage);
            userDiv.appendChild(usernameSpan);

            const ratingDiv = document.createElement('div');
            ratingDiv.classList.add('rating');

            const starIcon = document.createElement('span');
            starIcon.classList.add('star-icon');
            starIcon.textContent = '\u2605';

            const ratingSpan = document.createElement('span');
            ratingSpan.textContent = post.rating || '';

            ratingDiv.appendChild(starIcon);
            ratingDiv.appendChild(ratingSpan);

            infoContainer.appendChild(userDiv);
            infoContainer.appendChild(ratingDiv);

            postElement.appendChild(infoContainer);

            postsContainer.appendChild(postElement);
        });
    })
    .catch(error => console.error('Error fetching posts:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    fetchPosts();
});

