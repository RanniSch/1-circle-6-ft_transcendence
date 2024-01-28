// const root = document.getElementById("root");
// const foreground = document.getElementById("foreground");
// const menu = document.getElementById("menu");
// const navbar = document.getElementById("navbar");

// let is_navbar = false;

// let is_fullscreen = false;

// navbar.innerHTML = `<div class="nav"><ul><li>THIS</li><li>ARE</li><li>THE</li><li>OPTIONS</li></ul></div>`;
// menu.innerHTML = `<button class="menu">MENU</button>`;
// foreground.innerHTML = `<img class=\"foreground\"; src=\"../tr_src/foreground.png\"></img>`;
// root.innerHTML = `<div class=\"screen\"><img width=\"1500px\"; src=\"../tr_src/tv.png\" alt=\"TV\"></img></div>`;

// document.addEventListener("keydown", function (event) {
//     if (event.key === "Escape" && is_fullscreen === false) {
//         is_fullscreen = true;
//         foreground.innerHTML = ``;
//         root.innerHTML = 
//         `<div class=\"screen full-screen\">
//             <img src=\"../tr_src/tv.png\" alt=\"TV\"></img>
//         </div>`;
//     } else {
//         foreground.innerHTML = `<img class=\"foreground\"; src=\"../tr_src/foreground.png\"></img>`
//         root.innerHTML = 
//         `<div class=\"screen\">
//             <img width=\"1500px\"; src=\"../tr_src/tv.png\" alt=\"TV\"></img>
//         </div>`
//         is_fullscreen = false;
//     }
// });