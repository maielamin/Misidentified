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

var Modal = (function() {

    var trigger = $qsa('.modal__trigger'); // what you click to activate the modal
    var modals = $qsa('.modal'); // the entire modal (takes up entire window)
    var modalsbg = $qsa('.modal__bg'); // the entire modal (takes up entire window)
    var content = $qsa('.modal__content'); // the inner content of the modal
      var closers = $qsa('.modal__close'); // an element used to close the modal
    var w = window;
    var isOpen = false;
      var contentDelay = 400; // duration after you click the button and wait for the content to show
    var len = trigger.length;
  
    // make it easier for yourself by not having to type as much to select an element
    function $qsa(el) {
      return document.querySelectorAll(el);
    }
  
    var getId = function(event) {
  
      event.preventDefault();
      var self = this;
      // get the value of the data-modal attribute from the button
      var modalId = self.dataset.modal;
      var len = modalId.length;
      // remove the '#' from the string
      var modalIdTrimmed = modalId.substring(1, len);
      // select the modal we want to activate
      var modal = document.getElementById(modalIdTrimmed);
      // execute function that creates the temporary expanding div
      makeDiv(self, modal);
    };
  
    var makeDiv = function(self, modal) {
  
      var fakediv = document.getElementById('modal__temp');
  
      /**
       * if there isn't a 'fakediv', create one and append it to the button that was
       * clicked. after that execute the function 'moveTrig' which handles the animations.
       */
  
      if (fakediv === null) {
        var div = document.createElement('div');
        div.id = 'modal__temp';
        self.appendChild(div);
        moveTrig(self, modal, div);
      }
    };
  
    var moveTrig = function(trig, modal, div) {
      var trigProps = trig.getBoundingClientRect();
      var m = modal;
      var mProps = m.querySelector('.modal__content').getBoundingClientRect();
      var transX, transY, scaleX, scaleY;
      var xc = w.innerWidth / 2;
      var yc = w.innerHeight / 2;
  
      // this class increases z-index value so the button goes overtop the other buttons
      trig.classList.add('modal__trigger--active');
  
      // these values are used for scale the temporary div to the same size as the modal
      scaleX = mProps.width / trigProps.width;
      scaleY = mProps.height / trigProps.height;
  
      scaleX = scaleX.toFixed(3); // round to 3 decimal places
      scaleY = scaleY.toFixed(3);
  
  
      // these values are used to move the button to the center of the window
      transX = Math.round(xc - trigProps.left - trigProps.width / 2);
      transY = Math.round(yc - trigProps.top - trigProps.height / 2);
  
          // if the modal is aligned to the top then move the button to the center-y of the modal instead of the window
      if (m.classList.contains('modal--align-top')) {
        transY = Math.round(mProps.height / 2 + mProps.top - trigProps.top - trigProps.height / 2);
      }
  
  
          // translate button to center of screen
          trig.style.transform = 'translate(' + transX + 'px, ' + transY + 'px)';
          trig.style.webkitTransform = 'translate(' + transX + 'px, ' + transY + 'px)';
          // expand temporary div to the same size as the modal
          div.style.transform = 'scale(' + scaleX + ',' + scaleY + ')';
          div.style.webkitTransform = 'scale(' + scaleX + ',' + scaleY + ')';
  
  
          window.setTimeout(function() {
              window.requestAnimationFrame(function() {
                  open(m, div);
              });
          }, contentDelay);
  
    };
  
    var open = function(m, div) {
  
      if (!isOpen) {
        // select the content inside the modal
        var content = m.querySelector('.modal__content');
        // reveal the modal
        m.classList.add('modal--active');
        // reveal the modal content
        content.classList.add('modal__content--active');
  
        /**
         * when the modal content is finished transitioning, fadeout the temporary
         * expanding div so when the window resizes it isn't visible ( it doesn't
         * move with the window).
         */
  
        content.addEventListener('transitionend', hideDiv, false);
  
        isOpen = true;
      }
  
      function hideDiv() {
        // fadeout div so that it can't be seen when the window is resized
        div.style.opacity = '0';
        content.removeEventListener('transitionend', hideDiv, false);
      }
    };
  
    var close = function(event) {
  
          event.preventDefault();
      event.stopImmediatePropagation();
  
      var target = event.target;
      var div = document.getElementById('modal__temp');
  
      /**
       * make sure the modal__bg or modal__close was clicked, we don't want to be able to click
       * inside the modal and have it close.
       */
  
      if (isOpen && target.classList.contains('modal__bg') || target.classList.contains('modal__close')) {
  
        // make the hidden div visible again and remove the transforms so it scales back to its original size
        div.style.opacity = '1';
        div.removeAttribute('style');
  
              /**
              * iterate through the modals and modal contents and triggers to remove their active classes.
        * remove the inline css from the trigger to move it back into its original position.
              */
  
              for (var i = 0; i < len; i++) {
                  modals[i].classList.remove('modal--active');
                  content[i].classList.remove('modal__content--active');
                  trigger[i].style.transform = 'none';
          trigger[i].style.webkitTransform = 'none';
                  trigger[i].classList.remove('modal__trigger--active');
              }
  
        // when the temporary div is opacity:1 again, we want to remove it from the dom
              div.addEventListener('transitionend', removeDiv, false);
  
        isOpen = false;
  
      }
  
      function removeDiv() {
        setTimeout(function() {
          window.requestAnimationFrame(function() {
            // remove the temp div from the dom with a slight delay so the animation looks good
            div.remove();
          });
        }, contentDelay - 50);
      }
  
    };
  
    var bindActions = function() {
      for (var i = 0; i < len; i++) {
        trigger[i].addEventListener('click', getId, false);
        closers[i].addEventListener('click', close, false);
        modalsbg[i].addEventListener('click', close, false);
      }
    };
  
    var init = function() {
      bindActions();
    };
  
    return {
      init: init
    };
  
  }());
  
  Modal.init();