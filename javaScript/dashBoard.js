const navbar = document.querySelector(".navBar");
// Reusability
const activeClass = "navBarItemActive";

// Active state
let currentActive = document.querySelector(".navBarItemActive");
//Event listener only on parent element; Event delegation
navbar.addEventListener("click", function (event) {

    const clickedItem = event.target.closest(".navBarItem");
    //Below statement defines if item is not present or current item is already active then stop function
    if (clickedItem === null || clickedItem === currentActive) {
        return;
    }
    // Adds/removes classes(Main logic)
    currentActive.classList.remove(activeClass);
    clickedItem.classList.add(activeClass);
    // points to latest navbar item
    currentActive = clickedItem;

});
// Daily Tip Logic
const tips = [
    " Drink at least 8 glasses of water a day to stay hydrated.",
    " Aim for at least 30 minutes of physical activity daily.",
    " Incorporate more fruits and vegetables into your diet.",
    " Get at least 7-8 hours of sleep each night for optimal health.",
    " Take short breaks during work to stretch and move around.",
    " Practice mindfulness or meditation to reduce stress.",
    " Limit your intake of processed foods and sugary drinks."
];

function displayDailyTip() {
    const tipText = document.getElementById("tipText");
    const randomIndex = Math.floor(Math.random() * tips.length);
    tipText.textContent = tips[randomIndex];
}
// Call the function to display a tip when the page loads
displayDailyTip();

// Dynamic Greeting Logic
const now = new Date();
const hour = now.getHours();
let greeting;

if (hour < 12) greeting = "Good Morning";
else if (hour < 17) greeting = "Good Afternoon";
else greeting = "Good Evening";

//  Day & Time based greeting
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const formatted = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} - ${hour % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;

// Subtext for greeting
const motivations = [
    "| Remember, every step counts towards a healthier you!",
    "| Stay consistent and you'll see amazing results!",
    "| Your dedication today will pay off tomorrow!",
    "| Keep pushing, you're doing great!",
    "| Believe in yourself and all that you are capable of!"
];

// Insert greeting and motivation and date time.
document.getElementById("greeting").textContent = greeting + ", User! Welcome to Health & Fitness.";
document.getElementById("dateTime").textContent = formatted;
document.getElementById("subGreeting").textContent = motivations[Math.floor(Math.random() * motivations.length)];
