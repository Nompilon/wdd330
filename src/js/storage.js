export function getMeals() {
  return JSON.parse(localStorage.getItem("meals")) || [];
}

export function saveMeals(meals) {
  localStorage.setItem("meals", JSON.stringify(meals));
}

export function getGoals() {
  return (
    JSON.parse(localStorage.getItem("goals")) || {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 70,
    }
  );
}

export function saveGoals(goals) {
  localStorage.setItem("goals", JSON.stringify(goals));
}

export function getProfileImage() {
  return localStorage.getItem("profileImage") || null;
}

export function saveProfileImage(imageData) {
  localStorage.setItem("profileImage", imageData);
}
