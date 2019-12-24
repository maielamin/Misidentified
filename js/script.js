var canvas = document.getElementById('canvas');
canvas.addEventListener('click', click, false);
var c = canvas.getContext("2d");
var button = document.getElementById('reset');
button.addEventListener('click', init, false);
var scoreField = document.getElementById('score');

////CONSTANTS/////////////////////////////  easy white and hard black
var COLORS = [
    "#FFF1DB", //0
    "#FFD6B5", //1
    "#F1BF98", //2
    "#E0A57D", //3
    "#DCC3BA", //4
    "#E9D3C5", //5
    "#CD9D7A", //6
    "#92543c", //7 dark started
    "#7c432e", //8
    "#6f3c27"  //9
];

var HEIGHT = 16;
var WIDTH = 16;
var BLOCK_SIZE = 25;
/** 2-10 */
var NUMBER_OF_COLORS = 9;
var EMPTY = -1;

canvas.width = WIDTH * BLOCK_SIZE;
canvas.height = HEIGHT * BLOCK_SIZE;
var grid = [];
var valid = false;
var score = 0;

init();

//////////////////////////////////////////

function init() {
    for (var i = 0; i < WIDTH; i++) {
        grid[i] = [];
        for (var j = 0; j < HEIGHT; j++) {
            grid[i][j] = Math.floor(Math.random() * (NUMBER_OF_COLORS));
        }
    }
    valid = true;
    scoreField.innerHTML = score = 0;
    draw();
}

/** TODO:this probably doesn't work in nested divs */
function getCursorPosition(event) {
    var mouseX;
    var mouseY;
    if (event.pageX || event.pageY) {
        mouseX = event.pageX;
        mouseY = event.pageY;
    } else {
        mouseX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        mouseY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    mouseX -= canvas.offsetLeft;
    mouseY -= canvas.offsetTop;
    var x = Math.floor(mouseX / BLOCK_SIZE);
    var y = Math.floor(mouseY / BLOCK_SIZE);
    y = HEIGHT - y - 1; //reverse the y
    return new Block(x, y);
}

/** @constructor */
function Block(x, y) {
    this.x = x;
    this.y = y;
}

function draw() {
    c.fillStyle = "#000000";
    c.fillRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < WIDTH; i++) {
        for (var j = grid[i].length - 1; j >= 0; j--) { //start from top block in column
            c.fillStyle = COLORS[grid[i][j]];
            c.fillRect(i * BLOCK_SIZE, (HEIGHT - j - 1) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE); //last element is drawn topmost
        }
    }
}

function click(event) {
    if (!valid) {
        return;
    }
    var block = getCursorPosition(event);
    if (typeof grid[block.x][block.y] === 'undefined') {
        return;
    }
    var color = grid[block.x][block.y];
    var r = remove(block.x, block.y, color);
    if (r != 1) {
        empty();
        scoreField.innerHTML = score += r * r;
        draw();
        validate();
    } else {
        grid[block.x][block.y] = color; //put back the emptied block
    }
}

function remove(x, y, color) {
    var result = 0;
    if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) { //out of bounds check
        return result;
    }
    if (grid[x][y] != color) { //colors don't match - leave it
        return result;
    }
    grid[x][y] = EMPTY;

    result += 1;
    result += remove(x, y - 1, color);
    result += remove(x, y + 1, color);
    result += remove(x - 1, y, color);
    result += remove(x + 1, y, color);
    return result;
}

function empty() {
    for (var i = 0; i < WIDTH; i++) {
        for (var j = grid[i].length - 1; j >= 0; j--) { //iterate backwards because of splice
            if (grid[i][j] === EMPTY) {
                grid[i].splice(j, 1);
            }
        }
    }
}

function validate() {
    for (var i = 0; i < WIDTH; i++) {
        for (var j = grid[i].length - 1; j >= 0; j--) {
            if (isBlockPlayable(i, j)) return;
        }
    }
    finish();
}

function finish() {
    c.fillStyle = "rgba(255, 255, 255, 0.33)";
    c.fillRect(0, 0, canvas.width, canvas.height);
    document.getElementById("end").style.display='block';
    valid = false;
}

function isBlockPlayable(x, y) {
    return (
        (x > 0 && grid[x][y] === grid[x - 1][y]) ||
        (y > 0 && grid[x][y] === grid[x][y - 1]) ||
        (x < WIDTH - 1 && grid[x][y] === grid[x + 1][y]) ||
        (y < HEIGHT - 1 && grid[x][y] === grid[x][y + 1]));
}