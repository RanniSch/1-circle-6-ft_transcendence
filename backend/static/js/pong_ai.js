// AI mode
export let aiMode = false;
export let aiLastUpdateTime = 0;
export let aiReactionTime = 500; // AI updates its decision every 500ms to 1500ms
export let aiMarginError = 15; // AI margin of error in pixels
export let aiDifficultyAdjustmentFactor = 0.1; // AI difficulty adjustment factor

// AI paddle movement
export function moveAIPaddle(rightPaddle, ball, canvasHeight, paddleWidth) {
    if (aiMode && Date.now() - aiLastUpdateTime > aiReactionTime) {
        aiLastUpdateTime = Date.now();
        aiAdjustDifficulty(leftPaddle.score, rightPaddle.score);

        let aiPredictBallY = aiPredictBallPosition(ball, canvasHeight, paddleWidth);

        // AI logic
        let aiTargetY = aiPredictBallY + (Math.random() * 2 - 1) * aiMarginError;
        wKeyPressed = aiTargetY < rightPaddle.y + rightPaddle.height / 2;
        sKeyPressed = aiTargetY > rightPaddle.y + rightPaddle.height / 2;
    }
}

export function aiAdjustDifficulty(leftPaddleScore, rightPaddleScore) {
    let scoreDiff = leftPaddleScore - rightPaddleScore;
    if (scoreDiff > 2 || scoreDiff < -2) {
        let adjustment = aiReactionTime * aiDifficultyAdjustmentFactor;
        aiReactionTime += scoreDiff > 2 ? -adjustment : adjustment;
        aiMarginError += scoreDiff > 2 ? -adjustment : adjustment;
    }

    // keep reaction time and margin error within reasonable bounds
    aiReactionTime = Math.max(500, Math.min(aiReactionTime, 1500));
    aiMarginError = Math.max(10, Math.min(aiMarginError, 50));
}

export function aiPredictBallPosition(ball, canvasWidth, paddleWidth) {
    let futureBallX = ball.x;
    let futureBallY = ball.y;
    let futureBallDX = ball.dx;
    let futureBallDY = ball.dy;

    // predict until the ball is close to the AI paddle
    while (futureBallX < canvasWidth - paddleWidth) {
        futureBallX += futureBallDX;
        futureBallY += futureBallDY;

        // bounce off top and bottom walls
        if (futureBallY - ball.radius < 0 || futureBallY + ball.radius > canvas.height) futureBallDY *= -1;
    }
    return futureBallY;
}

export { moveAIPaddle, aiAdjustDifficulty, aiPredictBallPosition };