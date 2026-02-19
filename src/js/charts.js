/* global Chart */

import { getMeals } from "./storage.js";

let chartInstance = null;

export function renderNutrientChart(ctx) {
  if (!ctx) return;

  const meals = getMeals();
  if (!meals.length) return;

  const dailyTotals = {};
  meals.forEach((meal) => {
    const date = meal.date
      ? meal.date.split("T")[0]
      : new Date().toISOString().split("T")[0];
    if (!dailyTotals[date]) {
      dailyTotals[date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    dailyTotals[date].calories += meal.calories;
    dailyTotals[date].protein += meal.protein;
    dailyTotals[date].carbs += meal.carbs;
    dailyTotals[date].fat += meal.fat;
  });

  const labels = Object.keys(dailyTotals).sort();
  const caloriesData = labels.map((d) => dailyTotals[d].calories);
  const proteinData = labels.map((d) => dailyTotals[d].protein);
  const carbsData = labels.map((d) => dailyTotals[d].carbs);
  const fatData = labels.map((d) => dailyTotals[d].fat);

  const data = {
    labels,
    datasets: [
      {
        label: "Calories",
        data: caloriesData,
        borderColor: "#F39C12",
        backgroundColor: "#F39C12AA",
        fill: true,
      },
      {
        label: "Protein",
        data: proteinData,
        borderColor: "#27AE60",
        backgroundColor: "#27AE60AA",
        fill: true,
      },
      {
        label: "Carbs",
        data: carbsData,
        borderColor: "#1ABC9C",
        backgroundColor: "#1ABC9CAA",
        fill: true,
      },
      {
        label: "Fat",
        data: fatData,
        borderColor: "#2980B9",
        backgroundColor: "#2980B9AA",
        fill: true,
      },
    ],
  };

  const config = {
    type: "line",
    data,
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Nutrient Intake Trends" },
      },
      scales: {
        y: { beginAtZero: true },
        x: { title: { display: true, text: "Date" } },
      },
    },
  };

  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, config);
}
