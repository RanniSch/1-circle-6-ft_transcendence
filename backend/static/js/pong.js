const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");
let mode = 'local'; // standard play mode
let socket;
let gameShouldStart = false;
let gameStarted = false;

function setupRemoteGame(game_session_id, startGame = false) {
    socket = new WebSocket('wss://' + window.location.host + '/ws/pong/' + game_session_id + '/');

    socket.onmessage = function(e) {
        var data = JSON.parse(e.data);
        
        if (data.action === 'start_game') {
            document.getElementById('pongCanvas').style.display = 'block';
            resetGame();
            return;
        }
        
        // Update opponent's paddle and ball position
        rightPaddle.y = data.opponentPaddleY;
        ball.x = data.ballX;
        ball.y = data.ballY;
    };

    socket.onclose = function(e) {
        console.error('Websocket closed unexpectedly');
        resetGameFlags();
    };

    mode = 'remote';

    if (startGame) {
        document.getElementById('pongCanvas').style.display = 'block';
        resetGame();
    }
}

function updateRemoteGame() {
    // Send local paddle possition
    let gameState = {
        paddleY: leftPaddle.y,
        // other data
    };
    socket.send(JSON.stringify(gameState));
}

function startMatchmaking() {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) {
        console.log('No access token found');
        return;
    }
    function pollMatchmaking() {
        fetch(`https://${host}/api/find-match/`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Matchmaking failed!');
            }
            return response.json();
        
        })
        .then(data => {
            if (data.status === 'waiting') {
                console.log('Waiting for opponent...');
                // Optional: show waiting screen
                setTimeout(pollMatchmaking, 5000);
            } else if (data.status === 'found') {
                console.log('Opponent found:', data.opponent);
                setupRemoteGame(data.game_session_id, true);
            }
        })
        .catch(error => {
            console.log('Error startMatchmaking:', error);
        });
    }
    // Start initial polling
    pollMatchmaking();
}

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
        resetGameFlags();
    } else if (rightPaddle.score == 5) {
        alert("Right player wins!");
        winner = 'right';
        updateStats(winner);
        resetGame();
        resetGameFlags();
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

function drawInstructions() {
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillStyle = "#FFF";
    ctx.fillText("Press ENTER to start", canvas.width / 2 - 120, canvas.height / 2);

}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!gameShouldStart) {
        // Draw instructions wait for enter
        drawInstructions();
    } else if (canvas.style.display !== 'none') {
        if (mode === 'remote') {
            updateRemoteGame();
        } else {
            update();
        }
        draw();
    }
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener("keydown", function(event) {
    switch (event.keyCode) {
        case 87: // W key
            wKeyPressed = gameShouldStart && true;
            break;
        case 83: // S key
            sKeyPressed = gameShouldStart && true;
            break;
        case 38: // Up arrow
            upArrowPressed = gameShouldStart && true;
            event.preventDefault();
            break;
        case 40: // Down arrow
            downArrowPressed = gameShouldStart && true;
            event.preventDefault();
            break;
        case 13: // Enter key
            if (!gameStarted) {
                gameShouldStart = true;
                gameStarted = true;
                document.getElementById('pongCanvas').style.display = 'block';
                resetGame();
            }
            break;
    }
});

function resetGameFlags() {
    gameShouldStart = false;
    gameStarted = false;
}

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
            event.preventDefault();
            break;
        case 40: // Down arrow
            downArrowPressed = false;
            event.preventDefault();
            break;
    }
});

document.getElementById('playPongButtonLocal').addEventListener('click', function() {
    mode = 'local';
    const enteredName = document.getElementById('player2NameInput').value;
    playerTwoName = enteredName.trim() || 'Player2';

    resetGame();
    resetGameFlags();
    document.getElementById('pongCanvas').style.display = 'block';
});

document.getElementById('playPongButtonRemote').addEventListener('click', function () {
    mode = 'remote';
    startMatchmaking();
});

// Start the game
gameLoop();