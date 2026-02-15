// ========================
// Elements
// ========================
const addMealBtn = document.querySelector(".add-meal-btn");
const mealModal = document.getElementById("meal-modal");
const closeModal = document.getElementById("close-meal-modal");
const mealForm = document.getElementById("meal-form");
const mealLog = document.querySelector(".meal-log ul");

const summaryCalories = document.querySelector(".summary p:nth-child(2)");
const summaryProtein = document.querySelector(".summary p:nth-child(3)");
const summaryCarbs = document.querySelector(".summary p:nth-child(4)");
const summaryFat = document.querySelector(".summary p:nth-child(5)");

let editingIndex = null; // Track which meal is being edited

// ========================
// Modal open/close
// ========================
addMealBtn.addEventListener("click", () =>
  mealModal.classList.remove("hidden"),
);
closeModal.addEventListener("click", () => {
  mealModal.classList.add("hidden");
  mealForm.reset();
  editingIndex = null;
});

// ========================
// USDA API configuration
// ========================
const API_KEY = "l3MBTuUIJoqsUO9IvnLe8wKSDqT6dRQaTyLs7GTE"; // Replace with your key
const BASE_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

// ========================
// Fetch food data from USDA
// ========================
async function getFoodData(foodName) {
  try {
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&pageSize=1&api_key=${API_KEY}`,
    );
    const data = await response.json();

    if (!data.foods || data.foods.length === 0) return null;

    const food = data.foods[0];
    const nutrients = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    if (food.foodNutrients && food.foodNutrients.length > 0) {
      food.foodNutrients.forEach((n) => {
        const name = n.nutrientName.toLowerCase();
        const value = n.value || 0;
        if (name.includes("energy")) nutrients.calories = value;
        if (name.includes("protein")) nutrients.protein = value;
        if (name.includes("carbohydrate")) nutrients.carbs = value;
        if (name.includes("total lipid") || name.includes("fat"))
          nutrients.fat = value;
      });
    } else if (food.labelNutrients) {
      nutrients.calories = food.labelNutrients.calories?.value || 0;
      nutrients.protein = food.labelNutrients.protein?.value || 0;
      nutrients.carbs = food.labelNutrients.carbohydrates?.value || 0;
      nutrients.fat = food.labelNutrients.fat?.value || 0;
    }

    return nutrients;
  } catch (err) {
    console.error("USDA API error:", err);
    return null;
  }
}

// ========================
// Handle form submission
// ========================

const foodInput = document.getElementById("food-name");
const foodSuggestions = document.getElementById("food-suggestions");
const nutrientDisplay = document.getElementById("nutrient-info");
let suggestionTimeout;
foodInput.addEventListener("input", () => {
  clearTimeout(suggestionTimeout);
  const query = foodInput.value.trim();
  nutrientDisplay.innerHTML = ""; // clear nutrient info on new input
  if (query.length < 2) return;

  suggestionTimeout = setTimeout(async () => {
    try {
      foodSuggestions.innerHTML = "";

      // --- 1. USDA API ---
      const usdaResponse = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${API_KEY}`,
      );
      const usdaData = await usdaResponse.json();
      let suggestions = [];

      if (usdaData.foods && usdaData.foods.length > 0) {
        suggestions = usdaData.foods.map((f) => ({
          name: f.description,
          nutrients: extractUsdaNutrients(f),
        }));
      }

      // --- 2. Edamam API (if fewer than 10 results) ---
      if (suggestions.length < 10) {
        const edamamResponse = await fetch(
          `https://api.edamam.com/api/food-database/v2/parser?ingr=${encodeURIComponent(query)}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`,
        );
        const edamamData = await edamamResponse.json();

        if (edamamData.hints && edamamData.hints.length > 0) {
          const edamamSuggestions = edamamData.hints
            .map((h) => ({
              name: h.food.label,
              nutrients: extractEdamamNutrients(h.food),
            }))
            .slice(0, 10 - suggestions.length);
          suggestions = suggestions.concat(edamamSuggestions);
        }
      }

      // --- 3. Update datalist ---
      suggestions.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.name;
        option.dataset.nutrients = JSON.stringify(item.nutrients); // store nutrients
        foodSuggestions.appendChild(option);
      });
    } catch (err) {
      console.error("Error fetching food suggestions:", err);
    }
  }, 300);
});

// --- Helper functions ---
function extractUsdaNutrients(food) {
  const nutrients = {};
  if (food.foodNutrients) {
    food.foodNutrients.forEach((n) => {
      if (n.nutrientName.includes("Energy"))
        nutrients.calories = Math.round(n.value);
      if (n.nutrientName.includes("Protein")) nutrients.protein = n.value;
      if (n.nutrientName.includes("Carbohydrate")) nutrients.carbs = n.value;
      if (
        n.nutrientName.includes("Total lipid") ||
        n.nutrientName.includes("Fat")
      )
        nutrients.fat = n.value;
    });
  }
  return nutrients;
}

function extractEdamamNutrients(food) {
  const nutrients = food.nutrients || {};
  return {
    calories: Math.round(nutrients.ENERC_KCAL || 0),
    protein: nutrients.PROCNT || 0,
    carbs: nutrients.CHOCDF || 0,
    fat: nutrients.FAT || 0,
  };
}

// --- Show nutrient info when user selects a suggestion ---
foodInput.addEventListener("change", () => {
  const selectedOption = Array.from(foodSuggestions.options).find(
    (opt) => opt.value === foodInput.value,
  );
  if (selectedOption) {
    const nutrients = JSON.parse(selectedOption.dataset.nutrients);
    nutrientDisplay.innerHTML = `
            <p><strong>Calories:</strong> ${nutrients.calories} kcal</p>
            <p><strong>Protein:</strong> ${nutrients.protein} g</p>
            <p><strong>Carbs:</strong> ${nutrients.carbs} g</p>
            <p><strong>Fat:</strong> ${nutrients.fat} g</p>
        `;
  } else {
    nutrientDisplay.innerHTML = "";
  }
});
mealForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const mealType = document.getElementById("meal-type").value;
  const foodName = document.getElementById("food-name").value.trim();
  const portion = parseFloat(document.getElementById("portion").value);

  if (!foodName || isNaN(portion) || portion <= 0) {
    alert("Please enter valid food name and portion size.");
    return;
  }

  // Fetch USDA data
  const foodData = await getFoodData(foodName);
  if (!foodData) {
    alert("Food not found in USDA database!");
    return;
  }

  // Scale nutrients by portion (USDA data per 100g)
  const calories = (((foodData.calories || 0) * portion) / 100).toFixed(0);
  const protein = (((foodData.protein || 0) * portion) / 100).toFixed(1);
  const carbs = (((foodData.carbs || 0) * portion) / 100).toFixed(1);
  const fat = (((foodData.fat || 0) * portion) / 100).toFixed(1);

  const mealData = {
    mealType,
    foodName,
    portion,
    calories,
    protein,
    carbs,
    fat,
  };
  let meals = JSON.parse(localStorage.getItem("meals")) || [];

  if (editingIndex !== null) {
    // Edit existing meal
    meals[editingIndex] = mealData;
    localStorage.setItem("meals", JSON.stringify(meals));
    editingIndex = null;
  } else {
    // Add new meal
    meals.push(mealData);
    localStorage.setItem("meals", JSON.stringify(meals));
  }

  loadMeals();
  mealForm.reset();
  mealModal.classList.add("hidden");
});

// ========================
// Load meals and update summary
// ========================
function loadMeals() {
  const meals = JSON.parse(localStorage.getItem("meals")) || [];
  mealLog.innerHTML = "";

  let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  meals.forEach((m, index) => {
    totals.calories += parseFloat(m.calories);
    totals.protein += parseFloat(m.protein);
    totals.carbs += parseFloat(m.carbs);
    totals.fat += parseFloat(m.fat);

    const li = document.createElement("li");
    li.innerHTML = `
            ${m.mealType}: ${m.foodName} (${m.portion}g) — ${m.calories} kcal, 
            P:${m.protein}g C:${m.carbs}g F:${m.fat}g
            <span class="meal-actions">
                <a href="#" class="edit-meal">Edit</a> | 
                <a href="#" class="delete-meal">Delete</a>
            </span>
        `;

    li.querySelector(".edit-meal").addEventListener("click", () => {
      document.getElementById("meal-type").value = m.mealType;
      document.getElementById("food-name").value = m.foodName;
      document.getElementById("portion").value = m.portion;
      mealModal.classList.remove("hidden");
      editingIndex = index;
    });

    li.querySelector(".delete-meal").addEventListener("click", () => {
      meals.splice(index, 1);
      localStorage.setItem("meals", JSON.stringify(meals));
      loadMeals();
    });

    mealLog.appendChild(li);
  });

  const nutrientData = [
    { key: "calories", max: 2000, unit: "kcal" },
    { key: "protein", max: 150, unit: "g" },
    { key: "carbs", max: 250, unit: "g" },
    { key: "fat", max: 70, unit: "g" },
  ];

  const nutrientDivs = document.querySelectorAll(".summary .nutrient");

  nutrientData.forEach((nutrient, index) => {
    const total = totals[nutrient.key].toFixed(1);
    const percent = Math.min((total / nutrient.max) * 100, 100).toFixed(0);
    const nutrientDiv = nutrientDivs[index];

    const p = nutrientDiv.querySelector("p");
    p.innerHTML = `<strong>${nutrient.key.charAt(0).toUpperCase() + nutrient.key.slice(1)}:</strong> ${total} / ${nutrient.max} ${nutrient.unit}`;

    const bar = nutrientDiv.querySelector(".progress-fill");
    bar.style.width = `${percent}%`;
  });
}

window.addEventListener("DOMContentLoaded", loadMeals);
