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

