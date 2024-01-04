const root = document.getElementById("root");
const foreground = document.getElementById("foreground");
const menu = document.getElementById("menu");
const navbar = document.getElementById("nav");
const logger = document.getElementById("logger");
const log = document.getElementById("log");
// const pa = document.getElementById("playing_area");
const staticUrl = document.querySelector('meta[name="static-url"]').getAttribute('content');

foreground.innerHTML = `<img class=\"foreground\"; src="${staticUrl}imgs/foreground.png"></img>`;
root.innerHTML = `<div class=\"screen\">
                                    <p id=\"barl\" class=\"bar bleft\"></p>
                                    <p id=\"barr\" class=\"bar bright\"></p>
                                    <p id=\"ball\" class=\"ball\"></p>
                                    <img width=\"1500px\"; src="${staticUrl}imgs/tv.png" alt=\"TV\"></img>
                                </div>`;

const barl = document.getElementById("barl");
const barr = document.getElementById("barr");
const ball = document.getElementById("ball");


let is_fullscreen = false;
let is_navbar = false;
let is_login = false;

menu.innerHTML = `<button id=\"menu_btn\" class="menu left_corner">MENU</button>`;
const menu_btn = document.getElementById('menu_btn');

menu_btn.onclick = function() {
    if (is_navbar === false) {
        navbar.innerHTML = `<div class="nav"><br><br><br><br><br><br><ul><li>DASHBOARD</li><li>GAME HISTORY</li><li>ABOUT US</li><li>SEE GDPR</li></ul></div>`;
        ball.style.display = 'none';
        barl.style.display = 'none';
        barr.style.display = 'none';
        is_navbar = true;
    } else {
        is_navbar = false;
        ball.style.display = 'block';
        barl.style.display = 'block';
        barr.style.display = 'block';
        navbar.innerHTML = `<div class="nav_no_show"><ul><li>DASHBOARD</li><li>GAME HISTORY</li><li>ABOUT US</li><li>SEE GDPR</li></ul></div>`;
    }
};

log.innerHTML =  '<button id=\"login_btn\" class="menu right_corner">LOGIN</button>';
const login_btn = document.getElementById('login_btn');

login_btn.onclick = function() {
    if (is_login === false) {
        logger.innerHTML = ' <div class="login_overlay"> \
                                        <br><br><br><br><br><br> \
                                        <h1>LOG or SIGNUP</h1><br> \
                                        <p>Email: __________</p><br> \
                                        <p>Username: __________</p><br> \
                                        <p>Password: __________</p> \
                                    </div>';
        ball.style.display = 'none';
        barl.style.display = 'none';
        barr.style.display = 'none';
        is_login = true;
    } else {
        logger.innerHTML =  ' <div class="login_no_overlay"> \
                                                <br><br><br><br><br><br> \
                                                <h1>LOG or SIGNUP</h1><br> \
                                                <p>Email: __________</p><br> \
                                                <p>Username: __________</p><br> \
                                                <p>Password: __________</p> \
                                            </div>';
        ball.style.display = 'block';
        barl.style.display = 'block';
        barr.style.display = 'block';
        is_login = false;
    }
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && is_fullscreen === false) {
        foreground.innerHTML = ``;
        menu.style.display = "none";
        log.style.display = "none";
        root.innerHTML = `<div class=\"screen full-screen\">
                                                <p id=\"barl\" class=\"fullscreen_bar fullscreen_bleft\"></p>
                                                <p id=\"barr\" class=\"fullscreen_bar fullscreen_bright\"></p>
                                                <p id=\"ball\" class=\"ball\"></p>
                                                <img class="playground" src="${staticUrl}imgs/tv.png" alt=\"TV\"></img>
                                        </div>`;
        is_fullscreen = true;
    } else {
        if (event.key === "Escape" && is_fullscreen === true) {
            foreground.innerHTML = `<img class=\"foreground\"; src="${staticUrl}imgs/foreground.png"></img>`
            menu.style.display = "block";
            log.style.display = "block";
            root.innerHTML = 
            `<div class=\"screen\">
                    <p id=\"barl\" class=\"bar bleft\"></p>
                    <p id=\"barr\" class=\"bar bright\"></p>
                    <p id=\"ball\" class=\"ball\"></p>
                    <img class="playground" width=\"1500px\"; src="${staticUrl}imgs/tv.png" alt=\"TV\"></img>
            </div>`
            is_fullscreen = false;
        }
    }
});