document.addEventListener("DOMContentLoaded", () => {
  const addMealBtn = document.getElementById("open-meal-modal");
  const mealModal = document.getElementById("meal-modal");
  const closeModal = document.getElementById("close-meal-modal");
  const mealForm = document.getElementById("meal-form");
  const mealLog = document.getElementById("recent-meals");
  const nutrientDivs = document.querySelectorAll(".summary .nutrient");

  let editingIndex = null;

  addMealBtn.addEventListener("click", () =>
    mealModal.classList.remove("hidden")
  );

  closeModal.addEventListener("click", () => {
    mealModal.classList.add("hidden");
    mealForm.reset();
    editingIndex = null;
  });

  mealForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const mealType = document.getElementById("meal-type").value;
    const foodName = document.getElementById("food-name").value.trim();
    const portion = parseFloat(document.getElementById("portion").value);

    if (!foodName || isNaN(portion) || portion <= 0) {
      alert("Enter valid meal info.");
      return;
    }

    const mealData = {
      mealType,
      foodName,
      portion,
      calories: portion * 2,
      protein: portion * 0.1,
      carbs: portion * 0.2,
      fat: portion * 0.05,
    };

    let meals = JSON.parse(localStorage.getItem("meals")) || [];

    if (editingIndex !== null) {
      meals[editingIndex] = mealData;
      editingIndex = null;
    } else {
      meals.push(mealData);
    }

    localStorage.setItem("meals", JSON.stringify(meals));

    loadMeals();
    mealForm.reset();
    mealModal.classList.add("hidden");
  });

  function loadMeals() {
    const meals = JSON.parse(localStorage.getItem("meals")) || [];
    mealLog.innerHTML = "";

    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    meals.slice(-5).reverse().forEach((m, index) => {
      totals.calories += Number(m.calories);
      totals.protein += Number(m.protein);
      totals.carbs += Number(m.carbs);
      totals.fat += Number(m.fat);

      const li = document.createElement("li");
      li.textContent =
        `${m.mealType}: ${m.foodName} (${m.portion}g) — ${m.calories} kcal`;

      mealLog.appendChild(li);
    });

    const nutrientData = [
      { key: "calories", max: 2000, unit: "kcal" },
      { key: "protein", max: 150, unit: "g" },
      { key: "carbs", max: 250, unit: "g" },
      { key: "fat", max: 70, unit: "g" },
    ];

    nutrientData.forEach((nutrient, i) => {
      const total = totals[nutrient.key];
      const percent = Math.min((total / nutrient.max) * 100, 100);

      const div = nutrientDivs[i];
      div.querySelector("p").innerHTML =
        `<strong>${nutrient.key}:</strong> ${total.toFixed(1)} / ${nutrient.max} ${nutrient.unit}`;

      div.querySelector(".progress-fill").style.width = `${percent}%`;
    });
  }

  loadMeals();
});
