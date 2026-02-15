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
