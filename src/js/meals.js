// meals.js
import { getMeals, saveMeals, getGoals } from "./storage.js";
import { renderNutrientChart } from "./charts.js";
import { getFoodData } from "./api.js";

let editingIndex = null;

export function initMeals() {
  const mealForm = document.getElementById("meal-form");
  const mealLog = document.getElementById("recent-meals");
  const nutrientDivs = document.querySelectorAll(".summary .nutrient");
  const mealModal = document.getElementById("meal-modal");

  if (!mealForm || !mealLog || nutrientDivs.length === 0 || !mealModal) return;

  // Handle form submission (Add or Edit)
  mealForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const mealType = document.getElementById("meal-type").value;
    const foodName = document.getElementById("food-name").value.trim();
    const portion = parseFloat(document.getElementById("portion").value);

    if (!foodName || isNaN(portion) || portion <= 0) {
      return alert("Enter valid meal info.");
    }

    // Fetch nutrient info from API
    const nutrients = await getFoodData(foodName);
    if (!nutrients) return alert("Food not found in database.");

    // Multiply nutrients by portion (assuming portion is in grams)
    const factor = portion / 100; // USDA API nutrients are per 100g
    const mealData = {
      mealType,
      foodName,
      portion,
      calories: nutrients.calories * factor,
      protein: nutrients.protein * factor,
      carbs: nutrients.carbs * factor,
      fat: nutrients.fat * factor,
    };

    const meals = getMeals();
    if (editingIndex !== null) {
      meals[editingIndex] = mealData;
      editingIndex = null;
    } else {
      meals.push(mealData);
    }

    saveMeals(meals);

    // Reload meals and chart
    loadMeals(mealLog, nutrientDivs);
    renderNutrientChart(document.getElementById("nutrient-chart"));

    // Reset form and hide modal
    mealForm.reset();
    mealModal.classList.add("hidden");
  });

  // Initial load
  loadMeals(mealLog, nutrientDivs);
  renderNutrientChart(document.getElementById("nutrient-chart"));
}

export function loadMeals(mealLog, nutrientDivs) {
  const meals = getMeals();
  mealLog.innerHTML = "";

  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  meals
    .slice(-5)
    .reverse()
    .forEach((meal, index) => {
      totals.calories += meal.calories;
      totals.protein += meal.protein;
      totals.carbs += meal.carbs;
      totals.fat += meal.fat;

      const li = document.createElement("li");
      li.innerHTML = `
      ${meal.mealType}: ${meal.foodName} (${meal.portion}g) — ${meal.calories} kcal
      <span class="meal-actions">
        <a href="#" class="edit-meal">Edit</a> |
        <a href="#" class="delete-meal">Delete</a>
      </span>
    `;

      const mealModal = document.getElementById("meal-modal");
      const realIndex = meals.length - 1 - index;

      // Edit meal
      li.querySelector(".edit-meal").addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("meal-type").value = meal.mealType;
        document.getElementById("food-name").value = meal.foodName;
        document.getElementById("portion").value = meal.portion;
        editingIndex = realIndex;
        mealModal.classList.remove("hidden");
      });

      // Delete meal
      li.querySelector(".delete-meal").addEventListener("click", (e) => {
        e.preventDefault();
        const updatedMeals = meals.filter((_, i) => i !== realIndex);
        saveMeals(updatedMeals);
        loadMeals(mealLog, nutrientDivs);
        renderNutrientChart(document.getElementById("nutrient-chart")); // update chart
      });

      mealLog.appendChild(li);
    });

  updateSummary(totals, nutrientDivs);
}

function updateSummary(totals, nutrientDivs) {
  const goals = getGoals();
  const nutrientData = [
    { key: "calories", unit: "kcal" },
    { key: "protein", unit: "g" },
    { key: "carbs", unit: "g" },
    { key: "fat", unit: "g" },
  ];

  nutrientData.forEach((nutrient, i) => {
    const total = totals[nutrient.key];
    const max = goals[nutrient.key] || 1;
    const percent = Math.min((total / max) * 100, 100);

    const div = nutrientDivs[i];
    div.querySelector("p").innerHTML =
      `<strong>${nutrient.key}:</strong> ${total.toFixed(1)} / ${max} ${nutrient.unit}`;
    div.querySelector(".progress-fill").style.width = `${percent}%`;
  });
}
