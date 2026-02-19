// api.js
const API_KEY = "l3MBTuUIJoqsUO9IvnLe8wKSDqT6dRQaTyLs7GTE";

export async function searchFoods(query, signal) {
  const res = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${API_KEY}`,
    { signal },
  );
  const data = await res.json();
  return data.foods || [];
}

export async function getFoodData(foodName) {
  const res = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&pageSize=1&api_key=${API_KEY}`,
  );
  const data = await res.json();
  const food = data.foods?.[0];
  if (!food) return null;

  const nutrients = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  food.foodNutrients?.forEach((n) => {
    const name = n.nutrientName?.toLowerCase() || "";
    const value = Number(n.value) || 0;
    if (n.nutrientId === 1008) nutrients.calories = value;
    else if (name.includes("protein")) nutrients.protein = value;
    else if (name.includes("carbohydrate")) nutrients.carbs = value;
    else if (name.includes("total lipid") || name.includes("fat"))
      nutrients.fat = value;
  });

  return nutrients;
}
