document.addEventListener("DOMContentLoaded", () => {
  // ========================
  // Elements
  // ========================
  const addMealBtn = document.getElementById("open-meal-modal");
  const mealModal = document.getElementById("meal-modal");
  const closeModal = document.getElementById("close-meal-modal");
  const mealForm = document.getElementById("meal-form");
  const mealLog = document.getElementById("recent-meals");
  const foodInput = document.getElementById("food-name");
  const foodSuggestions = document.getElementById("food-suggestions");

  const goalsForm = document.getElementById("goals-form");
  const goalCalories = document.getElementById("goal-calories");
  const goalProtein = document.getElementById("goal-protein");
  const goalCarbs = document.getElementById("goal-carbs");
  const goalFat = document.getElementById("goal-fat");

  let editingIndex = null;
  let suggestionTimeout = null;

  // ========================
  // USDA API
  // ========================
  const API_KEY = "l3MBTuUIJoqsUO9IvnLe8wKSDqT6dRQaTyLs7GTE";

  async function getFoodData(foodName) {
    try {
      const res = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&pageSize=1&api_key=${API_KEY}`,
      );
      const data = await res.json();
      if (!data.foods || data.foods.length === 0) return null;
      const food = data.foods[0];
      const nutrients = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      if (food.foodNutrients) {
        food.foodNutrients.forEach((n) => {
          const name = n.nutrientName.toLowerCase();
          const value = n.value || 0;
          if (name.includes("energy")) nutrients.calories = value;
          if (name.includes("protein")) nutrients.protein = value;
          if (name.includes("carbohydrate")) nutrients.carbs = value;
          if (name.includes("total lipid") || name.includes("fat"))
            nutrients.fat = value;
        });
      }
      return nutrients;
    } catch (err) {
      console.error("USDA API error:", err);
      return null;
    }
  }

  // ========================
  // Nutrient goals
  // ========================
  function getNutrientGoals() {
    return (
      JSON.parse(localStorage.getItem("nutrientGoals")) || {
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 70,
      }
    );
  }
  function setNutrientGoals(goals) {
    localStorage.setItem("nutrientGoals", JSON.stringify(goals));
    loadMeals();
  }

  function initGoalsForm() {
    const goals = getNutrientGoals();
    goalCalories.value = goals.calories;
    goalProtein.value = goals.protein;
    goalCarbs.value = goals.carbs;
    goalFat.value = goals.fat;
  }

  if (goalsForm) {
      goalsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const goals = {
      calories: parseInt(goalCalories.value) || 2000,
      protein: parseInt(goalProtein.value) || 150,
      carbs: parseInt(goalCarbs.value) || 250,
      fat: parseInt(goalFat.value) || 70,
    };
    setNutrientGoals(goals);
    alert("Nutrient goals updated!");
  });

}


  function promptNutrientGoals() {
    const goals = {
      calories: parseInt(prompt("Set daily calorie goal:", 2000)) || 2000,
      protein: parseInt(prompt("Set daily protein goal (g):", 150)) || 150,
      carbs: parseInt(prompt("Set daily carbs goal (g):", 250)) || 250,
      fat: parseInt(prompt("Set daily fat goal (g):", 70)) || 70,
    };
    setNutrientGoals(goals);
    initGoalsForm();
  }

  // ========================
  // Meal modal open/close
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
  // Autocomplete
  // ========================
  foodInput.addEventListener("input", () => {
    clearTimeout(suggestionTimeout);
    const query = foodInput.value.trim();
    if (query.length < 2) return;

    suggestionTimeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${API_KEY}`,
        );
        const data = await res.json();
        foodSuggestions.innerHTML = "";
        if (data.foods && data.foods.length > 0) {
          data.foods.forEach((f) => {
            const option = document.createElement("option");
            option.value = f.description;
            foodSuggestions.appendChild(option);
          });
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);
  });

  // ========================
  // Submit meal
  // ========================
  mealForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const mealType = document.getElementById("meal-type").value;
    const foodName = foodInput.value.trim();
    const portion = parseFloat(document.getElementById("portion").value);

    if (!foodName || isNaN(portion) || portion <= 0)
      return alert("Enter valid food name and portion.");

    const foodData = await getFoodData(foodName);
    if (!foodData) return alert("Food not found in USDA database!");

    const mealData = {
      mealType,
      foodName,
      portion,
      calories: (((foodData.calories || 0) * portion) / 100).toFixed(0),
      protein: (((foodData.protein || 0) * portion) / 100).toFixed(1),
      carbs: (((foodData.carbs || 0) * portion) / 100).toFixed(1),
      fat: (((foodData.fat || 0) * portion) / 100).toFixed(1),
    };

    let meals = JSON.parse(localStorage.getItem("meals")) || [];
    if (editingIndex !== null) {
      meals[editingIndex] = mealData;
      editingIndex = null;
    } else {
      meals.push(mealData);
    }

    localStorage.setItem("meals", JSON.stringify(meals));
    mealForm.reset();
    mealModal.classList.add("hidden");
    loadMeals();
  });

  // ========================
  // Load meals and update summary
  // ========================
  function loadMeals() {
    const meals = JSON.parse(localStorage.getItem("meals")) || [];
    mealLog.innerHTML = "";
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    meals.forEach((m, i) => {
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
        foodInput.value = m.foodName;
        document.getElementById("portion").value = m.portion;
        mealModal.classList.remove("hidden");
        editingIndex = i;
      });

      li.querySelector(".delete-meal").addEventListener("click", () => {
        meals.splice(i, 1);
        localStorage.setItem("meals", JSON.stringify(meals));
        loadMeals();
      });

      mealLog.appendChild(li);
    });

    // Update summary
    const goals = getNutrientGoals();
    const nutrientData = [
      { key: "calories", max: goals.calories, unit: "kcal" },
      { key: "protein", max: goals.protein, unit: "g" },
      { key: "carbs", max: goals.carbs, unit: "g" },
      { key: "fat", max: goals.fat, unit: "g" },
    ];

    const nutrientDivs = document.querySelectorAll(".summary .nutrient");
    nutrientData.forEach((nutrient, index) => {
      const total = totals[nutrient.key].toFixed(1);
      const percent = Math.min((total / nutrient.max) * 100, 100).toFixed(0);
      const nutrientDiv = nutrientDivs[index];
      const p = nutrientDiv.querySelector("p");
      p.innerHTML = `<strong>${nutrient.key.charAt(0).toUpperCase() + nutrient.key.slice(1)}:</strong> ${total} / ${nutrient.max} ${nutrient.unit}`;
      nutrientDiv.querySelector(".progress-fill").style.width = `${percent}%`;
    });
  }

  // ========================
  // Init app
  // ========================
  if (!localStorage.getItem("nutrientGoals")) promptNutrientGoals();
  initGoalsForm();
  loadMeals();
});
