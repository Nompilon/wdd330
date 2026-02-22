import Chart from "chart.js/auto";
import { getMeals } from "./storage.js";

let chartInstance = null;

export function renderNutrientChart(canvas) {
  if (!canvas) return;

  // Destroy existing chart safely
  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy();
  }

  const ctx = canvas.getContext("2d");

  const meals = getMeals();
  if (!meals.length) return;

  const dailyTotals = {};

  meals.forEach((meal) => {
    const date = meal.date;
    if (!dailyTotals[date]) {
      dailyTotals[date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    dailyTotals[date].calories += meal.calories;
    dailyTotals[date].protein += meal.protein;
    dailyTotals[date].carbs += meal.carbs;
    dailyTotals[date].fat += meal.fat;
  });

  const labels = Object.keys(dailyTotals).sort();

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Calories",
          data: labels.map((d) => dailyTotals[d].calories),
          borderColor: "#F39C12",
          backgroundColor: "#F39C12AA",
          fill: true,
        },
        {
          label: "Protein",
          data: labels.map((d) => dailyTotals[d].protein),
          borderColor: "#27AE60",
          backgroundColor: "#27AE60AA",
          fill: true,
        },
        {
          label: "Carbs",
          data: labels.map((d) => dailyTotals[d].carbs),
          borderColor: "#1ABC9C",
          backgroundColor: "#1ABC9CAA",
          fill: true,
        },
        {
          label: "Fat",
          data: labels.map((d) => dailyTotals[d].fat),
          borderColor: "#2980B9",
          backgroundColor: "#2980B9AA",
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Nutrient Intake Trends" },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}
