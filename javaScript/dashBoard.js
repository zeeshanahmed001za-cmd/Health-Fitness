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