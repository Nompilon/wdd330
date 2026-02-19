// recommendations.js
import { getMeals, getGoals } from "./storage.js";

export function initRecipes() {
  const recipesUrl = "../json/recipes.json";
  const cardsContainer = document.getElementById("recipes-cards");
  const gridBtn = document.getElementById("gridViewBtn");
  const listBtn = document.getElementById("listViewBtn");
  const spotlightContainer = document.getElementById("spotlights-cards");
  const recipeModal = document.getElementById("recipe-modal");
  const recipeIframe = document.getElementById("recipe-iframe");
  const closeRecipeModal = document.getElementById("close-recipe-modal");

  if (
    !cardsContainer ||
    !gridBtn ||
    !listBtn ||
    !spotlightContainer ||
    !recipeModal ||
    !recipeIframe ||
    !closeRecipeModal
  )
    return;

  // Convert membership level number to name
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
  function createRecipeCard(recipe) {
    const card = document.createElement("section");
    card.classList.add("recipes-cards");

    const overlay = document.createElement("div");
    overlay.classList.add("image-container");

    const img = document.createElement("img");
    img.src = recipe.imageUrl;
    img.alt = recipe.recipeName;
    img.loading = "lazy";
    img.width = 300;
    img.onerror = () => {
      img.src = "images/placeholder.webp";
    };

    const titleOverlay = document.createElement("div");
    titleOverlay.classList.add("overlay-title");
    titleOverlay.textContent = recipe.recipeName;

    overlay.appendChild(img);
    overlay.appendChild(titleOverlay);
    card.appendChild(overlay);

    // Info row
    const infoRow = document.createElement("div");
    infoRow.classList.add("info-row");
    infoRow.innerHTML = `
      <div class="info-origin"><strong>Origin:</strong> ${recipe.origin}</div>
      <div class="info-healthBenefit"><strong>Health Benefits:</strong> ${recipe.healthBenefits}</div>
      <div class="info-membership"><strong>Membership Level:</strong> ${getMembershipName(recipe.membershipLevel)}</div>
    `;
    card.appendChild(infoRow);

    // Description
    const description = document.createElement("p");
    description.classList.add("recipe-description");
    description.textContent = recipe.description;
    card.appendChild(description);

    // View Recipe button
    const btn = document.createElement("button");
    btn.classList.add("recipe-btn");
    btn.textContent = "View Recipe";
    btn.addEventListener("click", () => {
      recipeIframe.src = recipe.recipeUrl;
      recipeModal.classList.remove("hidden");
    });
    card.appendChild(btn);

    return card;
  }

  // Close modal
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

  // Grid/List toggle
  gridBtn.addEventListener("click", () => {
    cardsContainer.classList.add("grid-view");
    cardsContainer.classList.remove("list-view");
  });
  listBtn.addEventListener("click", () => {
    cardsContainer.classList.add("list-view");
    cardsContainer.classList.remove("grid-view");
  });

  // Generate recommendations based on gaps
  function getRecommendations(currentTotals, goals, recipes) {
    const gaps = {
      calories: goals.calories - currentTotals.calories,
      protein: goals.protein - currentTotals.protein,
      carbs: goals.carbs - currentTotals.carbs,
      fat: goals.fat - currentTotals.fat,
    };

    return recipes.filter(
      (r) =>
        r.calories <= gaps.calories + 50 ||
        r.protein <= gaps.protein + 5 ||
        r.carbs <= gaps.carbs + 5 ||
        r.fat <= gaps.fat + 5,
    );
  }

  function renderRecommendations(targetElement, suggestions) {
    targetElement.innerHTML = "";
    if (suggestions.length === 0) {
      targetElement.textContent = "You are on track! No suggestions for now.";
      return;
    }

    suggestions.forEach((recipe) => {
      const div = document.createElement("div");
      div.classList.add("recommendation-card");
      div.innerHTML = `
        <strong>${recipe.recipeName}</strong>
        <p>Calories: ${recipe.calories} kcal</p>
        <p>Protein: ${recipe.protein} g | Carbs: ${recipe.carbs} g | Fat: ${recipe.fat} g</p>
      `;
      targetElement.appendChild(div);
    });
  }

  // Load recipes and render cards + recommendations
  async function loadRecipes() {
    try {
      const res = await fetch(recipesUrl);
      const data = await res.json();
      const recipes = data.recipes;

      // Render recipe cards
      cardsContainer.innerHTML = "";
      recipes.forEach((r) => cardsContainer.appendChild(createRecipeCard(r)));

      // Calculate current totals
      const meals = getMeals();
      const totals = meals.reduce(
        (acc, m) => {
          acc.calories += m.calories;
          acc.protein += m.protein;
          acc.carbs += m.carbs;
          acc.fat += m.fat;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      );

      const goals = getGoals();
      const suggestions = getRecommendations(totals, goals, recipes);

      renderRecommendations(spotlightContainer, suggestions);
    } catch (err) {
      console.error("Error loading recipes:", err);
    }
  }

  // Initial load
  loadRecipes();
}
