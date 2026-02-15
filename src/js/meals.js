import { getMeals, saveMeals } from "./storage.js";
import { getGoals } from "./goals.js";

const mealLog = document.getElementById("recent-meals");
const nutrientDivs = document.querySelectorAll(".summary .nutrient");

export function loadMeals() {
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
      li.textContent = `${meal.mealType}: ${meal.foodName} (${meal.portion}g) — ${meal.calories} kcal`;
      mealLog.appendChild(li);
    });

  updateSummary(totals);
}

function updateSummary(totals) {
  const goals = getGoals();

  const nutrientData = [
    { key: "calories", unit: "kcal" },
    { key: "protein", unit: "g" },
    { key: "carbs", unit: "g" },
    { key: "fat", unit: "g" },
  ];

  nutrientData.forEach((nutrient, i) => {
    const total = totals[nutrient.key];
    const max = goals[nutrient.key];
    const percent = Math.min((total / max) * 100, 100);

    const div = nutrientDivs[i];
    div.querySelector("p").innerHTML =
      `<strong>${nutrient.key}:</strong> ${total.toFixed(1)} / ${max} ${nutrient.unit}`;

    div.querySelector(".progress-fill").style.width = `${percent}%`;
  });
}
