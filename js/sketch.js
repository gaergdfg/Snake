var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 720;
canvas.height = 480;
document.body.appendChild(canvas);

var fps = 7;
var score = 0;
$(document).ready(function(){
    !$.cookie('highscore') ? $.cookie("highscore", '0', { expires: 365 }) : null;
});


var snakePos = [];
var freeFields = [];
var tileSize = 20;
var dir, olddir;
var apple;
var removed;

function createPoint(a, b) {
    return {x : a, y : b};
}

function delet(myIndex) {
    var a = freeFields.slice(0, myIndex);
    var b = freeFields.slice(myIndex + 1, freeFields.length);
    freeFields = a.concat(b);
}

function myFind(curr) {
    for(var i = 0; i < freeFields.length; i++) {
        if(curr.x == freeFields[i].x && curr.y == freeFields[i].y) {
            return i;
        }
    }
    return -1;
}

function main() {
    if (!snakePos.length) {
        drawPause();
    }
    if (snakePos.length) {
        updateSnake();
        catchedApple();
        isSnakeDead();
        drawGame();
    }
}

function getApple() {
    var res = parseInt(Math.random() * freeFields.length);
    return freeFields[res];
}

function initGame() {
    var a = canvas.width / 2 / tileSize;
    var b = canvas.height / 2 / tileSize;
    freeFields = [];
    for(var i = parseInt(0); i < canvas.width / tileSize; i++)
        for(var j = parseInt(0); j < canvas.height / tileSize; j++)
            freeFields.push(createPoint(i, j));
    snakePos = [];
    snakePos.push(createPoint(a, b));
    delet(myFind(snakePos[0]));
    dir = olddir = "D";
    apple = getApple();
    score = 0;
}

function pauseGame() {
    $.cookie("highscore", Math.max($.cookie("highscore"), score));
    snakePos = [];
}

function updateSnake() {
    var a = snakePos[0].x, b = snakePos[0].y;
    switch(dir) {
        case "A":
            snakePos.unshift(createPoint(a - 1, b));
            break;
        case "D":
            snakePos.unshift(createPoint(a + 1, b));
            break;
        case "W":
            snakePos.unshift(createPoint(a, b - 1));
            break;
        case "S":
            snakePos.unshift(createPoint(a, b + 1));
            break;
    }
    delet(myFind(snakePos[0]));
    removed = snakePos.pop();
    freeFields.push(removed);
    olddir = dir;
}

function catchedApple() {
    if(snakePos[0].x == apple.x && snakePos[0].y == apple.y) {
        apple = getApple();
        snakePos.push(removed);
        delet(myFind(snakePos[snakePos.length - 1]));
        score++;
    }
}

function isSnakeDead() {
    var a = snakePos[0].x, b = snakePos[0].y;
    if(a < 0 || a >= canvas.width / tileSize || b < 0 || b >= canvas.height / tileSize) {
        pauseGame();
    }
    for(var i = parseInt(1); i < snakePos.length; i++) {
        var headx = snakePos[0].x, heady = snakePos[0].y;
        var a = snakePos[i].x, b = snakePos[i].y;
        if(headx == a && heady == b) {
            pauseGame();
        }
    }
}

function drawPause() {
    // Background
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(76, 76, 76)";
    ctx.fill();
    ctx.closePath();

    // Highscore
    if ($.cookie("highscore")) {
        ctx.beginPath();
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "right";
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillText("Highscore: " + $.cookie("highscore"), canvas.width - 12, 30);
        ctx.closePath();
    }

    // Info
    ctx.beginPath();
    ctx.font = "bold 25px Arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(200, 200, 200, 0.7)";
    ctx.fillText("Press spacebar to start a new game", canvas.width * 0.2, canvas.height * 0.5, canvas.width * 0.6);
    ctx.font = "bold 22px Arial";
    ctx.fillText("Use W, A, S, D to move", canvas.width * 0.33, canvas.height * 0.58, canvas.width * 0.34);
    ctx.closePath();
}

function drawGame() {
    // Background
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(76, 76, 76)";
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
    ctx.closePath();

    // Snake
    var low = Math.max(60, 256 / snakePos.length);
    var shading = (snakePos.length == 1 ? null : ((256 - low) / (snakePos.length - 1)));
    for (var i = 0; i < snakePos.length; i++) {
        var color = 256 - Math.floor(i * shading);
        ctx.beginPath();
        ctx.fillStyle = "rgba(45, " + color + ", 0)";
        ctx.rect(snakePos[i].x * tileSize + 1, snakePos[i].y * tileSize + 1, tileSize - 2, tileSize - 2);
        ctx.fill();
        ctx.closePath();
    }

    // Apple
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.rect(apple.x * tileSize + 1, apple.y * tileSize + 1, tileSize - 2, tileSize - 2);
    ctx.fill();
    ctx.closePath();

    // Highscore
    ctx.beginPath();
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "right";
    ctx.fillText("Highscore: " + ($.cookie("highscore") ? $.cookie("highscore") : "-.-"), canvas.width - 12, 30);
    ctx.closePath();

    // Score
    ctx.beginPath();
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "right";
    ctx.fillText("Score: " + score, canvas.width - 12, 60);
    ctx.closePath();
}

$(document).bind('keypress', function(e) {
    var key = e.keyCode || e.which;
    switch(key) {
        case 32:                                            // spacebar
            if(!snakePos.length)
                initGame();
            break;
        case 97:                                            // A
            if(olddir != "D")
                dir = "A";
            break;
        case 100:                                            // D
            if (olddir != "A")
                dir = "D";
            break;
        case 119:                                            // W
            if (olddir != "S")
                dir = "W";
            break;
        case 115:                                            // S
            if (olddir != "W")
            dir = "S";
            break;
    }
});

setInterval(main, 1000 / fps);
