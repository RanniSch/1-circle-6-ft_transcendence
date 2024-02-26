import { getCurrentLanguage, translations } from "./appstate.js";

document.addEventListener('DOMContentLoaded', function() {
    const startTournamentMatchInput = document.createElement('input');
    startTournamentMatchInput.type = 'text';
    startTournamentMatchInput.placeholder = 'Enter Match ID';
    startTournamentMatchInput.id = 'startTournamentMatchInput';
    document.getElementById('tournamentMatchContainer').appendChild(startTournamentMatchInput);

    const startTournamentMatchButton = document.createElement('button');
    startTournamentMatchButton.textContent = translate('Start Tournament');
    startTournamentMatchButton.id = 'startTournamentMatchButton';
    document.getElementById('tournamentMatchContainer').appendChild(startTournamentMatchButton);

    startTournamentMatchButton.addEventListener('click', function() {
        startTournamentMatch();
    });
});

function translate(key) {
    var currentLanguage = getCurrentLanguage();
    return translations[key][currentLanguage];
}

const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");
let mode = 'local';
let colour = "white"
let backgroundColour = "black"
let enablePowerups = false;
let gameShouldStart = false;
let gameStarted = false;

// Game constants
const paddleWidth = 10, paddleHeight = 100;
const ballRadius = 10;
let upArrowPressed = false, downArrowPressed = false;
let wKeyPressed = false, sKeyPressed = false;
let playerTwoName = 'Player2';

// AI mode
let aiMode = false;
let aiLastUpdateTime = 0;
let aiReactionTime = 500; // Adjusted AI reaction time
let aiMarginError = 10;
let aiDifficultyAdjustmentFactor = 0.1;

// Objects
const leftPaddle = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0,
    speed: 1
};

const rightPaddle = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0,
    speed: 1
};

class powerUp {
    constructor(colour) {
    this.colour = colour;
    this.active = false;
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.radius = ballRadius;
    this.dx = 5 * (Math.random() < 0.5 ? -1 : 1);
    this.dy = 5 * (Math.random() < 0.5 ? -1 : 1);
    }
};

let powerup = new powerUp();

class enlargePaddle extends powerUp {
    constructor(){
        super("yellow");
    }
    power(paddle){
        paddle.height += 20;
        this.active = false;
    }
};

class speedUpBall extends powerUp {
    constructor(){
        super("red");
    }
    power(paddle){
        paddle.speed *= 1.2;
        this.active = false;
    }
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    speed: 1,
    dx: 5,
    dy: 5
};

function drawBackground(backgroundColour)
{
    ctx.globalCompositeOperation = 'destination-over'
    ctx.fillStyle = backgroundColour;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draw functions
function drawPaddle(x, y, width, height) {
    ctx.fillStyle = colour;
    ctx.fillRect(x, y, width, height);
}

function drawBall(x, y, radius, ballColour) {
    ctx.fillStyle = ballColour;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

// Game functions
function movePaddles() {
    // Reduced redundant code
    if (wKeyPressed && leftPaddle.y > 0) leftPaddle.y -= 10;
    if (sKeyPressed && (leftPaddle.y < canvas.height - leftPaddle.height)) leftPaddle.y += 10;
    if (upArrowPressed && rightPaddle.y > 0) rightPaddle.y -= 10;
    if (downArrowPressed && (rightPaddle.y < canvas.height - rightPaddle.height)) rightPaddle.y += 10;
}

function movePowerup() {
    if (powerup.active == true){
        powerup.x += powerup.dx;
        powerup.y += powerup.dy;

        if (powerup.y - powerup.radius < 0 || powerup.y + powerup.radius > canvas.height) powerup.dy *= -1;
        if (powerup.x < leftPaddle.x + leftPaddle.width && powerup.y > leftPaddle.y && powerup.y < leftPaddle.y + leftPaddle.height)
            powerup.power(leftPaddle);
        else if (powerup.x > rightPaddle.x - rightPaddle.width && powerup.y > rightPaddle.y && powerup.y < rightPaddle.y + rightPaddle.height) {
            powerup.power(rightPaddle);
        }
        if (ball.x + ball.radius < 0 || ball.x - ball.radius > canvas.width)  
            powerup.active = false;
    }
}

function moveBall() {    
    ball.x += ball.dx * ball.speed;
    ball.y += ball.dy * ball.speed;
    
    // Wall collision (top/bottom)
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) ball.dy *= -1;
    
    // Paddle collision
    if (ball.x < leftPaddle.x + leftPaddle.width && ball.y > leftPaddle.y && ball.y < leftPaddle.y + leftPaddle.height)
        paddleCollision(leftPaddle);
    else if (ball.x > rightPaddle.x - rightPaddle.width && ball.y > rightPaddle.y && ball.y < rightPaddle.y + rightPaddle.height)
        paddleCollision(rightPaddle);
    
    // Reset ball if it goes out of bounds
    if (ball.x + ball.radius < 0 || ball.x - ball.radius > canvas.width) {
        if (ball.x + ball.radius < 0) rightPaddle.score++;
        else leftPaddle.score++;
        checkWinner();
        resetBall();
    }
}

function paddleCollision(paddle) {
    ball.dx *= -1;
    if (Math.abs(ball.dx) < 20) ball.dx *= 1.05, ball.dy *= 1.05;
    ball.speed = paddle.speed;
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 5 * (Math.random() < 0.5 ? -1 : 1);
    ball.dy = 5 * (Math.random() < 0.5 ? -1 : 1);
}

function drawScore() {
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillStyle = colour;
    
    const playerName = window.playerOne || 'Player1';
    ctx.fillText(playerName, canvas.width / 4, 30);
    ctx.fillText(leftPaddle.score, canvas.width / 4, 70);
    
    ctx.fillText(playerTwoName, 3 * canvas.width / 4, 30);
    ctx.fillText(rightPaddle.score, 3 * canvas.width / 4, 70);
}

function drawInstructions() {
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillStyle = "white";
    ctx.fillText("Press ENTER to start", canvas.width / 2 - 120, canvas.height / 2);
}

// AI paddle movement
function moveAIPaddle() {
    if (aiMode && Date.now() - aiLastUpdateTime > aiReactionTime) {
        aiLastUpdateTime = Date.now();
        aiAdjustDifficulty();
        let aiPredictBallY = aiPredictBallPosition();
        
        let aiPaddleCenter = leftPaddle.y + leftPaddle.height / 2;
        let aiTargetY = aiPredictBallY + (Math.random() * 2 - 1) * aiMarginError;
        
        if (aiTargetY < aiPaddleCenter) {
            wKeyPressed = true;  // AI attempts to move up
            sKeyPressed = false;
        } else if (aiTargetY > aiPaddleCenter) {
            sKeyPressed = true;  // AI attempts to move down
            wKeyPressed = false;
        } else {
            wKeyPressed = false;
            sKeyPressed = false; // AI stays
        }

        // Apply AI paddle movement based on flags
        if (wKeyPressed && leftPaddle.y > 0) {
            leftPaddle.y -= 10;  // Move up by 10 units
        } else if (sKeyPressed && (leftPaddle.y < canvas.height - leftPaddle.height)) {
            leftPaddle.y += 10;  // Move down by 10 units
        }
    }
}

function aiAdjustDifficulty() {
    // Adjustments for AI difficulty
    let scoreDiff = leftPaddle.score - rightPaddle.score;
    if (scoreDiff > 2 || scoreDiff < -2) {
        let adjustment = aiReactionTime * aiDifficultyAdjustmentFactor;
        aiReactionTime += scoreDiff > 2 ? -adjustment : adjustment;
        aiMarginError += scoreDiff > 2 ? -adjustment : adjustment;
    }

    aiReactionTime = Math.max(500, Math.min(aiReactionTime, 1500));
    aiMarginError = Math.max(10, Math.min(aiMarginError, 50));
}

function aiPredictBallPosition() {
    // Optimized AI prediction logic
    let futureBallX = ball.x;
    let futureBallY = ball.y;
    let futureBallDx = ball.dx;
    let futureBallDy = ball.dy;

    if (futureBallDx <= 0) {
        return ball.y
    }

    while (futureBallX < canvas.width - paddleWidth) {
        futureBallX += futureBallDx;
        futureBallY += futureBallDy;
        if (futureBallY - ball.radius < 0 || futureBallY + ball.radius > canvas.height) {
            futureBallDy *= -1;
        }
    }
    return futureBallY;
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!gameStarted) drawInstructions();
    else {
        if (canvas.style.display !== 'none') {
            movePaddles();
            if (mode === 'AI') moveAIPaddle();
            moveBall();
            movePowerup();
            draw();
        }
    }
    requestAnimationFrame(gameLoop);
}

function drawPowerup() {
    if (powerup.active == false && enablePowerups == true){
        let random = Math.round(Math.random() * 500);
        if (random == 1) {
            powerup = new enlargePaddle();
            powerup.active = true;
        } else if (random == 2){
            powerup = new speedUpBall();
            powerup.active = true;
        }
    }
    if (powerup.active == true){
        drawBall(powerup.x, powerup.y, powerup.radius, powerup.colour);}
}

function draw() {
    drawPaddle(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    drawPaddle(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
    drawBall(ball.x, ball.y, ball.radius, colour);
    drawPowerup();
    drawScore();
    drawBackground(backgroundColour);
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
                gameStarted = true;
                gameShouldStart = true;
            }
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
        event.preventDefault();
        break;
        case 40: // Down arrow
        downArrowPressed = false;
        event.preventDefault();
        break;
    }
});

document.getElementById('enablePowerups').addEventListener('click', function() {
    var button = document.getElementById('enablePowerups');
    if (button.textContent.includes('OFF')) {
        button.textContent = button.textContent.replace('OFF', 'ON');
        enablePowerups = true;
      } else {
        button.textContent = button.textContent.replace('ON', 'OFF');
        enablePowerups = false;
      }
});

document.getElementById('changeBackgroundColour').addEventListener('click', function() {
    switch (backgroundColour) {
    case "black":
        colour = "black"
        backgroundColour = "white"
        break;
    case "white":
        colour = "white"
        backgroundColour = "black"
        break;
    }
});

document.getElementById('playPongButtonLocal').addEventListener('click', function() {
    mode = 'local';
    const enteredName = document.getElementById('player2NameInput').value;
    playerTwoName = enteredName.trim() || 'Player2';
    
    resetGame();
    document.getElementById('pongCanvas').style.display = 'block';
});

// AI mode button
document.getElementById('playPongButtonAI').addEventListener('click', function() {
    mode = 'AI';
    aiMode = true;
    resetGame();
    document.getElementById('pongCanvas').style.display = 'block';
});

document.getElementById('playPongButtonTournament').addEventListener('click', function() {
    const tournamentControls = document.getElementById('tournamentControls');

    // toggle the display of the tournament controls
    if (tournamentControls.style.display === 'none') {
        tournamentControls.style.display = 'block';
    } else {
        tournamentControls.style.display = 'none';
    }
});

document.getElementById('createTournamentButton').addEventListener('click', function() {
    const tournamentName = document.getElementById('tournamentNameInput').value.trim();
    startTournament(tournamentName);
    document.getElementById('tournamentNameInput').value = '';
});

document.getElementById('joinTournamentButton').addEventListener('click', function() {
    const tournamentId = document.getElementById('tournamentIDInput').value.trim();
    if (tournamentId) {
        joinTournament(tournamentId);
    } else {
        alert('Please enter a valid tournament ID');
    }
    document.getElementById('tournamentIDInput').value = '';
});
   
function startTournament(tournamentName) {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) {
        console.log(translate('No access token found'));
        return;
    }

    const data = {
        name: tournamentName,
        start_date: new Date().toISOString(),
    };

    fetch(`https://${host}/api/tournaments/create/`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            alert(translate('Please enter a tournament name'));
            throw new Error(translate('Failed to create tournament!'));
        }
        return response.json();
    })
    .then(data => {
        const message = `${translate('Tournament created! Tournament ID: ')} ${data.id}`
        alert(message);
    })
    .catch(error => console.error('Error startTournament:', error));
}

function joinTournament(tournamentId) {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) {
        console.log(translate('No access token found'));
        return;
    }

    fetch(`https://${host}/api/tournaments/${tournamentId}/join/`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(translate('Failed to join tournament!'));
        }
        return response.json();
    })
    .then(data => {
        console.log(translate('Joined tournament!'));
        alert(translate('Joined tournament!'));
    })
}

function resetGame() {
    leftPaddle.score = 0;
    rightPaddle.score = 0;
    resetBall();
    gameShouldStart = true;
    gameStarted = false;
}

// Start the game
gameLoop();

function updateStats(winner, loser) {
    const accessToken = localStorage.getItem('access');
    const url = `https://${host}/api/update-stats/`;
    
    let data = {
        winner: winner,
        loser: loser,
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

function checkWinner() {
    let winnerId, winnerName, loserName, score;
    let matchId = document.getElementById('startTournamentMatchInput').value;
    if (leftPaddle.score == 5 || rightPaddle.score == 5) {
        if (leftPaddle.score == 5) {
            winnerId = window.playerOneId;
            winnerName = window.playerOne || 'Player1';
            loserName = playerTwoName || 'Player2';
        } else {
            winnerId = window.playerTwoId;
            winnerName = playerTwoName || 'Player2';
            loserName = window.playerOne || 'Player1';
        }

        const accessToken = localStorage.getItem('access');
        const data_winner = {
            winner: winnerId,
            winner_username: winnerName,
        };

        fetch(`https://${host}/api/matches/${matchId}/update/`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data_winner)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update match!');
            }
            return response.json();
        })
        .then(data => {
            console.log('Match updated!');
            alert(`${winnerName} wins!`);
        })
        .catch(error => {
            console.log('Error checkWinner:', error);
        });

        score = `${leftPaddle.score} - ${rightPaddle.score}`;
        updateStats(winnerName, loserName);
        submitMatchHistory(winnerName, loserName, score);
        alert(`${winnerName} wins!`);
        resetGame();
        resetGameFlags();
    }
}

function resetGameFlags() {
    gameShouldStart = false;
    gameStarted = false;
}

function submitMatchHistory(winner, loser, score) {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) {
        console.log('No access token found');
        return;
    }

    const url = `https://${host}/api/match-history/`;
    let data = {
        player1: window.playerOne || 'Player1',
        player2: playerTwoName || 'Player2',
        winner: winner,
        loser: loser,
        score: score,
    };

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
            throw new Error('Failed to submit match history!');
        }
        console.log(data);
        return response.json();
    })
    .then(data => {
        console.log('Match history submitted!');
    })
    .catch(error => {
        console.log('Error submitMatchHistory:', error);
    });
}

function startTournamentMatch() {
    const accessToken = localStorage.getItem('access');
    const matchId = document.getElementById('startTournamentMatchInput').value;
    if (!matchId) {
        console.log('Please enter a valid match ID');
        alert('Please enter a valid match ID');
        return;
    }

    fetch(`https://${host}/api/matches/${matchId}/`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to join tournament!');
        }
        return response.json();
    })
    .then(data => {
        console.log('Tournament Details:', data);
        window.playerOneId = data.player1;
        window.playerOne = data.player1_username;
        window.playerTwoId = data.player2;
        playerTwoName = data.player2_username;
        resetGame();
        gameShouldStart = true;
        gameStarted = false;
        console.log('Tournament match started!');
        document.getElementById('pongCanvas').style.display = 'block';
    })
    .catch(error => {
        console.error('Error startTournamentMatch:', error);
    });
}