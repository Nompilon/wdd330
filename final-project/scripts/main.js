document.addEventListener("DOMContentLoaded", () => {
    const meals = JSON.parse(localStorage.getItem("meals")) || [];
    const recentMealsList = document.getElementById("recent-meals");

    // ==========================
    // Update nutrient totals
    // ==========================
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    meals.forEach(m => {
        totals.calories += parseFloat(m.calories);
        totals.protein += parseFloat(m.protein);
        totals.carbs += parseFloat(m.carbs);
        totals.fat += parseFloat(m.fat);
    });

    const nutrientData = [
        { key: "calories", max: 2000, unit: "kcal" },
        { key: "protein", max: 150, unit: "g" },
        { key: "carbs", max: 250, unit: "g" },
        { key: "fat", max: 70, unit: "g" }
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

    // ==========================
    // Show last 5 meals
    // ==========================
    recentMealsList.innerHTML = "";
    meals.slice(-5).reverse().forEach(m => {
        const li = document.createElement("li");
        li.textContent = `${m.mealType}: ${m.foodName} (${m.portion}g)`;
        recentMealsList.appendChild(li);
    });

    // ==========================
    // Run notifications
    // ==========================
    NotificationModule.checkNutrientGoals();
    NotificationModule.scheduleReminders();
});
