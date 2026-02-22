import { initMeals } from "./meals.js";
import { setupProfileUpload } from "./ui.js";
import { initNavigation } from "./navigation.js";
import { renderNutrientChart } from "./charts.js";

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  setupProfileUpload();
  initMeals();

  const chartCanvas = document.getElementById("nutrient-chart");
  renderNutrientChart(chartCanvas);
});
