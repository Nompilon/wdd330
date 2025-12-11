// ===========================
// Notification Module
// ===========================
const NotificationModule = (() => {

    // Default daily reminder times (can be customizable later)
    const reminderTimes = ["08:00", "12:00", "18:00"]; // Breakfast, Lunch, Dinner

    // Function to check nutrient goals and alert
    function checkNutrientGoals() {
        const goals = JSON.parse(localStorage.getItem("nutrientGoals")) || {
            calories: 2000,
            protein: 150,
            carbs: 250,
            fat: 70
        };
        const meals = JSON.parse(localStorage.getItem("meals")) || [];

        let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        meals.forEach(m => {
            totals.calories += parseFloat(m.calories);
            totals.protein += parseFloat(m.protein);
            totals.carbs += parseFloat(m.carbs);
            totals.fat += parseFloat(m.fat);
        });

        let alerts = [];

        if (totals.calories > goals.calories) alerts.push("You've exceeded your daily calorie goal!");
        if (totals.protein < goals.protein * 0.5) alerts.push("You should eat more protein today!");
        if (totals.carbs < goals.carbs * 0.5) alerts.push("Consider adding more carbs to reach your goal!");
        if (totals.fat < goals.fat * 0.5) alerts.push("You need more fats to meet your daily goal!");

        alerts.forEach(msg => showNotification(msg));
    }

    // Function to show a browser notification
    function showNotification(message) {
        if (!("Notification" in window)) return; // Browser does not support notifications

        if (Notification.permission === "granted") {
            new Notification("NutriTrack Hub Reminder", { body: message, icon: "images/nutrition_icon_136342.svg" });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("NutriTrack Hub Reminder", { body: message, icon: "images/nutrition_icon_136342.svg" });
                }
            });
        }
    }

    // Function to schedule daily reminders
    function scheduleReminders() {
        setInterval(() => {
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5); // HH:MM
            if (reminderTimes.includes(currentTime)) {
                showNotification("Don't forget to log your meal!");
            }
        }, 60000); // check every minute
    }

    return {
        checkNutrientGoals,
        scheduleReminders
    };
})();
