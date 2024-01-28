const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Game constants
const paddleWidth = 10, paddleHeight = 100;
const ballRadius = 10;
let upArrowPressed = false, downArrowPressed = false;
let wKeyPressed = false, sKeyPressed = false;
let playerTwoName = 'Player2';

// Objects
const leftPaddle = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

const rightPaddle = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    speed: 5,
    dx: 5,
    dy: 5
};

// Draw functions
function drawPaddle(x, y, width, height) {
    ctx.fillStyle = "#FFF";
    ctx.fillRect(x, y, width, height);
}

function drawBall(x, y, radius) {
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

// Game functions
function movePaddles() {
    if (wKeyPressed && leftPaddle.y > 0) {
        leftPaddle.y -= 10;
    } else if (sKeyPressed && (leftPaddle.y < canvas.height - leftPaddle.height)) {
        leftPaddle.y += 10;
    }

    if (upArrowPressed && rightPaddle.y > 0) {
        rightPaddle.y -= 10;
    } else if (downArrowPressed && (rightPaddle.y < canvas.height - rightPaddle.height)) {
        rightPaddle.y += 10;
    }
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (top/bottom)
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    // Paddle collision
    if ((ball.x < leftPaddle.x + leftPaddle.width && ball.y > leftPaddle.y && ball.y < leftPaddle.y + leftPaddle.height) ||
        (ball.x > rightPaddle.x - rightPaddle.width && ball.y > rightPaddle.y && ball.y < rightPaddle.y + rightPaddle.height)) {
        ball.dx *= -1;

        // Increase speed
        if (Math.abs(ball.dx) < 20) {
            ball.dx *= 1.05;
        }
        if (Math.abs(ball.dy) < 20) {
            ball.dy *= 1.05;
        }
    }

    // Reset ball if it goes out of bounds
    if (ball.x + ball.radius < 0) {
        rightPaddle.score++;
        checkWinner();
        resetBall();
    } else if (ball.x - ball.radius > canvas.width) {
        leftPaddle.score++;
        checkWinner();
        resetBall();
    }
}

function checkWinner() {
    let winner;
    if (leftPaddle.score == 5) {
        alert("Left player wins!");
        winner = 'left';
        updateStats(winner);
        resetGame();
    } else if (rightPaddle.score == 5) {
        alert("Right player wins!");
        winner = 'right';
        updateStats(winner);
        resetGame();
    }
}

function updateStats(winner) {
    const accessToken = localStorage.getItem('access');
    const url = `https://${host}/api/update-stats/`;

    let data = {
        winner: winner,
        gameCompleted: true
    };

    if (!accessToken) {
        console.log('No access token found');
        return;
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Stats not updated!');
        }
        return response.json();
    })
    .then(data => {
        console.log('Stats updated!');
    })
    .catch(error => {
        console.log('Erorr UpdateStats:', error);
    });
}

function resetGame() {
    leftPaddle.score = 0;
    rightPaddle.score = 0;
    resetBall();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 5;
    ball.dy = 5;
}

function update() {
    movePaddles();
    moveBall();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    drawPaddle(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
    drawBall(ball.x, ball.y, ball.radius);
    drawScore();
}

function drawScore() {
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillStyle = "#FFF";

    const playerName = window.playerOne || 'Player1';
    ctx.fillText(playerName, canvas.width / 4, 30);
    ctx.fillText(leftPaddle.score, canvas.width / 4, 70);
    
    ctx.fillText(playerTwoName, 3 * canvas.width / 4, 30);
    ctx.fillText(rightPaddle.score, 3 * canvas.width / 4, 70);
}

// Game loop
function gameLoop() {
    if (canvas.style.display !== 'none') {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener("keydown", function(event) {
    switch (event.keyCode) {
        case 87: // W key
            wKeyPressed = true;
            break;
        case 83: // S key
            sKeyPressed = true;
            break;
        case 38: // Up arrow
            upArrowPressed = true;
            break;
        case 40: // Down arrow
            downArrowPressed = true;
            break;
    }
});

document.addEventListener("keyup", function(event) {
    switch (event.keyCode) {
        case 87: // W key
            wKeyPressed = false;
            break;
        case 83: // S key
            sKeyPressed = false;
            break;
        case 38: // Up arrow
            upArrowPressed = false;
            break;
        case 40: // Down arrow
            downArrowPressed = false;
            break;
    }
});

// Start the game
gameLoop();

document.getElementById('playPongDiv').addEventListener('click', function() {
    const enteredName = document.getElementById('player2NameInput').value;
    playerTwoName = enteredName.trim() || 'Player2';

    document.getElementById('pongCanvas').style.display = 'block';
});