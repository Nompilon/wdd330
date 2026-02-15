export function setupModal() {
  const addMealBtn = document.getElementById("open-meal-modal");
  const mealModal = document.getElementById("meal-modal");
  const closeModal = document.getElementById("close-meal-modal");

  addMealBtn.addEventListener("click", () =>
    mealModal.classList.remove("hidden")
  );

  closeModal.addEventListener("click", () =>
    mealModal.classList.add("hidden")
  );
}
