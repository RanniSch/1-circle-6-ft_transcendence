
//Get references to HTML elements
const menuBtn = document.getElementById('menu');
const loginBtn = document.getElementById('login');
const loginPage = document.getElementById('login-page');
const loginForm = document.getElementById('login-form');
const body = document.body;
const backgroundUrl = body.getAttribute('data-background-url');

//Function to dynamically adjust the background image
function adjustBackgroundImage() {
    const screenWidth = window.innerWidth;

    if (screenWidth <= 768) {
        body.style.backgroundImage = `url("${backgroundUrl}")`;
    } else {
        body.style.backgroundImage = `url("${backgroundUrl}")`;
    }
}

//Initial adjustment when page loads
adjustBackgroundImage();

//Update background when window is resized
window.addEventListener('resize', adjustBackgroundImage);

//Function to toggle the navigation menu
function toggleMenu() {
    menuBtn.classList.toggle('menu-open');

    if (menuBtn.classList.contains('menu-open')) {
        //Menu is open, display menu items
        addMenuItems();
    } else {
        removeMenuItems();
    }
}

function toggleLoginPage() {
    if (loginPage.style.display === 'none' || loginPage.style.display === '') {
        loginPage.style.display = 'block';
        menuBtn.style.display = 'none';
    } else {
        loginPage.style.display = 'none';
        menuBtn.style.display = 'block';
    }
}

//Event listener for the menu button
menuBtn.addEventListener('click', toggleMenu);
loginBtn.addEventListener('click', toggleLoginPage);

//Function to add menu items
function addMenuItems() {
    const menuOpen = document.getElementById('menu');
    const menuItems = document.createElement('ul');
    menuItems.innerHTML = `
        <li>Start Game</li>
        <li>Create Tournament</li>
    `;
    menuOpen.appendChild(menuItems);
}

//Function to remove menu items
function removeMenuItems() {
    const menuOpen = document.getElementById('menu');
    const menuItems = menuOpen.querySelector('ul');
    if (menuItems) {
        menuOpen.removeChild(menuItems);
    }
}

//Event listener for form submission
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
})