export async function searchRecipes(query) {
  if (!query) return [];
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`,
  );
  const data = await res.json();
  return data.meals || []; 
}

export async function getRandomRecipe() {
  const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
  const data = await res.json();
  return data.meals?.[0] || null;
}
