// ui.js
import { getProfileImage, saveProfileImage } from "./storage.js";
import { searchFoods } from "./api.js";

export function setupModal() {
  const addMealBtn = document.getElementById("open-meal-modal");
  const mealModal = document.getElementById("meal-modal");
  const closeModal = document.getElementById("close-meal-modal");

  if (!addMealBtn || !mealModal || !closeModal) return;

  addMealBtn.addEventListener("click", () =>
    mealModal.classList.remove("hidden"),
  );
  closeModal.addEventListener("click", () => mealModal.classList.add("hidden"));
}

export function setupProfileUpload() {
  const profileImg = document.getElementById("profile-img");
  const profileInput = document.getElementById("profile-upload");
  if (!profileImg || !profileInput) return;

  const savedImage = getProfileImage();
  if (savedImage) profileImg.src = savedImage;

  profileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert("Max 2MB image");

    const reader = new FileReader();
    reader.onload = () => {
      profileImg.src = reader.result;
      saveProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function setupAutocomplete(foodInput, suggestionList) {
  if (!foodInput || !suggestionList) return;

  let controller, timeout;
  foodInput.addEventListener("input", () => {
    clearTimeout(timeout);
    if (controller) controller.abort();
    controller = new AbortController();

    const query = foodInput.value.trim();
    if (query.length < 2) return (suggestionList.innerHTML = "");

    timeout = setTimeout(async () => {
      try {
        const foods = await searchFoods(query, controller.signal);
        suggestionList.innerHTML = "";
        foods.forEach((food) => {
          const option = document.createElement("option");
          option.value = food.description;
          suggestionList.appendChild(option);
        });
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    }, 300);
  });
}
