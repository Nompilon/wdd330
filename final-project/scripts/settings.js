// ============================
// Nutrient Goals Management
// ============================

// Get form and message elements
const goalForm = document.getElementById('goal-form');
const message = document.getElementById('goal-message');

// Load saved goals from localStorage (if any)
document.addEventListener('DOMContentLoaded', () => {
  const savedGoals = JSON.parse(localStorage.getItem('nutrientGoals'));
  if (savedGoals) {
    document.getElementById('calorie-goal').value = savedGoals.calories || '';
    document.getElementById('protein-goal').value = savedGoals.protein || '';
    document.getElementById('carb-goal').value = savedGoals.carbs || '';
    document.getElementById('fat-goal').value = savedGoals.fat || '';
  }
});

// Handle form submission
goalForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const goals = {
    calories: document.getElementById('calorie-goal').value,
    protein: document.getElementById('protein-goal').value,
    carbs: document.getElementById('carb-goal').value,
    fat: document.getElementById('fat-goal').value
  };

  // Save to localStorage
  localStorage.setItem('nutrientGoals', JSON.stringify(goals));

  // Show confirmation message
  message.textContent = '✅ Nutrient goals saved successfully!';
  message.style.color = 'green';

  // Optional: auto-hide after 3 seconds
  setTimeout(() => (message.textContent = ''), 3000);
});
