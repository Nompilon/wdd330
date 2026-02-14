const recipesUrl = "../json/recipes.json";
const cardsContainer = document.getElementById("recipes-cards");
const gridBtn = document.getElementById("gridViewBtn");
const listBtn = document.getElementById("listViewBtn");
const spotlightContainer = document.getElementById("spotlights-cards");
const recipeModal = document.getElementById("recipe-modal");
const recipeIframe = document.getElementById("recipe-iframe");
const closeRecipeModal = document.getElementById("close-recipe-modal");


// Helper: convert membershipLevel number to name
function getMembershipName(level) {
    switch (level) {
        case 1: return 'Free';
      case 2: return 'Basic';
      case 3: return 'Premium';
        default: return 'Unknown';
    }
}

// Create a recipe card
// Create a recipe card
function createRecipeCard(recipe, includeOverlay = true) {
    const card = document.createElement('section');
    card.classList.add('recipes-cards');

    // Image overlay
    if (includeOverlay) {
        const overlay = document.createElement('div');
        overlay.classList.add('image-container');

        const img = document.createElement('img');
        img.src = recipe.imageUrl;
        img.alt = recipe.recipeName;
        img.loading = 'lazy';
        img.width = 300;
        img.onerror = () => { img.src = 'images/placeholder.webp'; };

        const titleOverlay = document.createElement('div');
        titleOverlay.classList.add('overlay-title');
        titleOverlay.textContent = recipe.recipeName;

        overlay.appendChild(img);
        overlay.appendChild(titleOverlay);
        card.appendChild(overlay);
    }

    // Info row
    const infoRow = document.createElement('div');
    infoRow.classList.add('info-row');
    infoRow.innerHTML = `
        <div class="info-origin"><strong>Origin:</strong> ${recipe.origin}</div>
        <div class="info-healthBenefit"><strong>Health Benefits:</strong> ${recipe.healthBenefits}</div>
        <div class="info-membership"><strong>Membership Level:</strong> ${getMembershipName(recipe.membershipLevel)}</div>
    `;
    card.appendChild(infoRow);

    // Description
    const description = document.createElement('p');
    description.classList.add('recipe-description');
    description.textContent = recipe.description;
    card.appendChild(description);

    // View Recipe button
    const btn = document.createElement('button');
    btn.classList.add('recipe-btn');
    btn.textContent = 'View Recipe';
    btn.addEventListener('click', () => {
        recipeIframe.src = recipe.recipeUrl; // load recipe
        recipeModal.classList.remove('hidden'); // show modal
    });
    card.appendChild(btn);

    return card;
}

// Close modal on X
closeRecipeModal.addEventListener("click", () => {
    recipeModal.classList.add("hidden");
    recipeIframe.src = "";
});

// Close modal when clicking outside content
recipeModal.addEventListener("click", (e) => {
    if (e.target === recipeModal) {
        recipeModal.classList.add("hidden");
        recipeIframe.src = "";
    }
});

// ============================
// Load recipes from JSON
// ============================
async function loadRecipes() {
    try {
        const res = await fetch(recipesUrl);
        const data = await res.json();
        const recipes = data.recipes;

        cardsContainer.innerHTML = "";
        recipes.forEach(recipe => {
            const card = createRecipeCard(recipe);
            cardsContainer.appendChild(card);
        });
    } catch (err) {
        console.error("Error loading recipes:", err);
    }
}

// ============================
// Grid/List view toggle
// ============================
gridBtn.addEventListener("click", () => {
    cardsContainer.classList.add("grid-view");
    cardsContainer.classList.remove("list-view");
});

listBtn.addEventListener("click", () => {
    cardsContainer.classList.add("list-view");
    cardsContainer.classList.remove("grid-view");
});

// ============================
// Initialize
// ============================
loadRecipes();
