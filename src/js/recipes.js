const recipesUrl = "../json/recipes.json";
const cardsContainer = document.getElementById("recipes-cards");
const gridBtn = document.getElementById("gridViewBtn");
const listBtn = document.getElementById("listViewBtn");
const spotlightContainer = document.getElementById("spotlights-cards");

// Helper: convert membershipLevel number to name
function getMembershipName(level) {
  switch (level) {
    case 1:
      return "Free";
    case 2:
      return "Basic";
    case 3:
      return "Premium";
    default:
      return "Unknown";
  }
}

// Create a recipe card
function createRecipeCard(recipe, includeOverlay = true) {
    const card = document.createElement('section');
    card.classList.add('recipes-cards');

    const overlayHTML = includeOverlay ? `
        <div class="image-container">
            <img src="${recipe.imageUrl}" alt="${recipe.recipeName}" loading="lazy" width="300"
                 onerror="this.src='images/placeholder.webp';">
            <div class="overlay-title">${recipe.recipeName}</div>
        </div>
    ` : '';

    card.innerHTML = `
        ${overlayHTML}
        <div class="info-row">
            <div class="info-origin"><strong>Origin:</strong> ${recipe.origin}</div>
            <div class="info-healthBenefit"><strong>Health Benefits:</strong> ${recipe.healthBenefits}</div>
            <div class="info-membership"><strong>Membership Level:</strong> ${getMembershipName(recipe.membershipLevel)}</div>
        </div>
        <p class="recipe-description">${recipe.description}</p>
        <a href="${recipe.recipeUrl}" target="_blank">
            <button class="recipe-btn">View Recipe</button>
        </a>
    `;
    return card;
}

// -------- DIRECTORY PAGE LOGIC --------
if (cardsContainer && gridBtn && listBtn) {
  let recipesData = [];

  async function getRecipes() {
    try {
      const response = await fetch(recipesUrl);
      const data = await response.json();
      recipesData = data.recipes;
      displayRecipes("grid");
    } catch (error) {
      console.error("Error fetching recipes:", error);
      cardsContainer.innerHTML = "<p>Unable to load recipes.</p>";
    }
  }

  function displayRecipes(viewType) {
    cardsContainer.innerHTML = "";
    cardsContainer.classList.toggle("grid-view", viewType === "grid");
    cardsContainer.classList.toggle("list-view", viewType === "list");

    recipesData.forEach(recipe => {
      const card = createRecipeCard(recipe, viewType === "grid");
      cardsContainer.appendChild(card);
    });
  }

  gridBtn.addEventListener("click", () => displayRecipes("grid"));
  listBtn.addEventListener("click", () => displayRecipes("list"));

  getRecipes();
closeRecipeModal.addEventListener("click", () => {
    recipeModal.classList.add("hidden");
    recipeIframe.src = "";
  });

  recipeModal.addEventListener("click", (e) => {
    if (e.target === recipeModal) {
      recipeModal.classList.add("hidden");
      recipeIframe.src = "";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const recipesDiv = document.getElementById("recipes-section");

  async function loadRecipes() {
    try {
      const response = await fetch("../json/recipes.json");
      const data = await response.json();

      const recipes = data.recipes;

      displayRecipes(recipes);

    } catch (error) {
      console.error("Error loading recipes:", error);
      recipesDiv.innerHTML = "<p>Failed to load recipes.</p>";
    }
  }

  function displayRecipes(recipes) {
    recipesDiv.innerHTML = "";

    recipes.forEach(recipe => {

      const card = document.createElement("div");
      card.classList.add("recipe-card");

      const img = document.createElement("img");
      img.src = recipe.imageUrl;
      img.alt = recipe.recipeName;
      img.loading = "lazy";

      const title = document.createElement("h3");
      title.textContent = recipe.recipeName;

      const button = document.createElement("button");
      button.textContent = "View Recipe";

      button.addEventListener("click", () => {
        window.open(recipe.recipeUrl, "_blank");
      });

      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(button);

      recipesDiv.appendChild(card);
    });
  }

  loadRecipes();
});
