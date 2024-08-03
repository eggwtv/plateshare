document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.querySelector('.back-arrow');
    if (backButton) {
        backButton.addEventListener('click', function(event) {
            event.preventDefault(); 
            window.location.href = '/home'; // Redirects to the home page
        });
    }

    fetchRecipeDetails();
});

async function fetchRecipeDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');

    if (!recipeId) {
        console.error('Recipe ID is missing');
        return;
    }

    try {
        const response = await fetch(`/api/test-recipe/${recipeId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch recipe details');
        }
        const recipeData = await response.json();
        updateRecipeDetails(recipeData);
    } catch (error) {
        console.error('Error fetching recipe:', error);
    }
}

function updateRecipeDetails(data) {
    console.log('Updating Recipe Details:', data); 
    const recipe = data.recipe;
    const ingredients = data.ingredients;
    const steps = data.steps;

    const recipeTitle = document.querySelector('.recipe-title');
    const lastUpdated = document.querySelector('.date');
    const rating = document.querySelector('.rating');
    const prepTime = document.querySelector('.prep-time');
    const cookTime = document.querySelector('.cook-time');
    const difficulty = document.querySelector('.difficulty');
    const serves = document.querySelector('.serves');
    const ingredientsList = document.querySelector('.ingredients');
    const instructionsList = document.querySelector('.instructions');
    const recipeImage = document.querySelector('.image');

    recipeTitle.textContent = recipe.username;
    lastUpdated.innerHTML = `<strong>Last updated:</strong> ${new Date().toLocaleDateString()} <span class="clock-icon">&#128340;</span>`; 
    rating.innerHTML = `<strong>Rating:</strong> Not available`; 
    prepTime.textContent = `Prep Time: ${recipe.prepTime}`;
    cookTime.textContent = `Cook Time: ${recipe.cookTime}`;
    difficulty.textContent = `Difficulty: ${recipe.difficulty ? recipe.difficulty : 'Not specified'}`;
    serves.textContent = `Serves: ${recipe.servingSize}`;
    recipeImage.src = `/${recipe.photoPath}`;

    ingredientsList.innerHTML = '';
    ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = `${ingredient.quantityAmount} ${ingredient.quantityType} - ${ingredient.ingredientDescription}`;
        ingredientsList.appendChild(li);
    });

    instructionsList.innerHTML = '';
    steps.forEach((step, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${step.stepDescription}`;
        instructionsList.appendChild(li);
    });
}

