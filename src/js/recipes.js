import { searchRecipes, getRandomRecipe } from "./mealdb.js";

const cardsContainer = document.getElementById("recipes-cards");
const gridBtn = document.getElementById("gridViewBtn");
const listBtn = document.getElementById("listViewBtn");
const searchInput = document.getElementById("recipe-search");

let currentRecipes = [];
let currentQuery = "";

// ---------------- Helper Functions ----------------
function getMembershipName(level) {
  switch (level) {
    case 1: return "Free";
    case 2: return "Basic";
    case 3: return "Premium";
    default: return "Unknown";
  }
}

function mapMealDBRecipe(meal) {
  return {
    recipeName: meal.strMeal,
    healthBenefits: meal.strCategory || "",
    origin: meal.strArea || "",
    recipeUrl: meal.strSource || meal.strYoutube || "#",
    imageUrl: meal.strMealThumb || "images/placeholder.webp",
    membershipLevel: 1,
    description: meal.strInstructions || "",
  };
}

function createRecipeCard(recipe, includeOverlay = true) {
  const card = document.createElement('section');
  card.classList.add('recipe-card');

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
    <p class="recipe-description">${recipe.description.substring(0, 150)}...</p>
    <a href="${recipe.recipeUrl}" target="_blank">
        <button class="recipe-btn">View Recipe</button>
    </a>
  `;

  return card;
}

// ---------------- Display Recipes ----------------
function displayRecipes(recipes, viewType = "grid") {
  if (!cardsContainer) return;

  cardsContainer.innerHTML = "";
  cardsContainer.classList.remove("grid-view", "list-view");
  cardsContainer.classList.add(viewType + "-view");

  recipes.forEach(recipe => {
    const card = createRecipeCard(recipe, viewType === "grid");
    cardsContainer.appendChild(card);
  });
}

// ---------------- Fetch Recipes ----------------
async function loadRecipes(query = "") {
  if (!cardsContainer) return;

  try {
    let meals = [];
    if (!query) {
      // Empty search: get 5 random recipes
      const randomPromises = Array.from({ length: 5 }, () => getRandomRecipe());
      const randomMeals = await Promise.all(randomPromises);
      meals = randomMeals.filter(Boolean); // remove any nulls
    } else {
      meals = await searchRecipes(query);
    }

    currentRecipes = meals.map(mapMealDBRecipe);
    currentQuery = query;

    displayRecipes(currentRecipes, "grid");
  } catch (error) {
    console.error("Error fetching recipes:", error);
    cardsContainer.innerHTML = "<p>Unable to load recipes.</p>";
  }
}

// ---------------- Grid/List Toggle ----------------
gridBtn.addEventListener("click", () => displayRecipes(currentRecipes, "grid"));
listBtn.addEventListener("click", () => displayRecipes(currentRecipes, "list"));

// ---------------- Live Search ----------------
if (searchInput) {
  let debounceTimeout;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    const query = searchInput.value.trim();
    debounceTimeout = setTimeout(() => loadRecipes(query), 500);
  });
}

// ---------------- Initial Load ----------------
document.addEventListener("DOMContentLoaded", () => {
  loadRecipes(); // show 5 random recipes on page load
});
