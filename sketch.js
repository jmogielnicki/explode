var canvas;
var bug;  // Declare object
var bugList = [];
var stalkList = [];
var activeAnchorX = 200;
var activeAnchorY = 200;
var bugOutline = [0,0,0,0];
var backgroundTransparency = 255;

function setup() {

  // Canvas stuffs
  canvas = createCanvas(windowWidth-100, windowHeight-110);
  canvas.parent('canvasContainer');
  canvas.mouseOver(function() { onCanvas = true; });
  canvas.mouseOut( function() { onCanvas = false; });
  createClumps(40, 30);

}

function draw() {
  // fill(255, 255, 255, backgroundTransparency);
  // rect(-1, -1, width+2, height+2);

  background(255, 255, 255, backgroundTransparency);

  for (i = 0; i < bugList.length; i++) {
    bug = bugList[i];
    bug.move();
    bug.display();

    // Once a bug becomes transparent, remove it from list
    if(bug.transparency < 1) {
      bugList.splice(i, 1);
    }
  }

  if(bugList.length === 0) {
    createClumps(40, 30);
    if (backgroundTransparency === 255) {
      backgroundTransparency = 40;
    } else {
      backgroundTransparency = 255;
    }
  }
}

function createClumps(numClumps, numBugs) {
  for(var i = 0; i < numClumps; i++) {
    xPosition = random(100, width-100);
    yPosition = random(50, height-50);

    for(var iTwo = 0; iTwo < numBugs; iTwo++) {
      bugList.push(new Jitter(xPosition, yPosition));
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth-100, windowHeight-120);
}


function adjustAnchor(current, adjustment, speed) {
  adjustmentSpeed = speed;
  return (current * (1 - adjustmentSpeed)) + (adjustment * adjustmentSpeed)
}


// Jitter class
function Jitter(xAnchorpoint, yAnchorPoint) {

  // AnchorPoints are whatever the current middle of the box is, targetAnchors are where we want the next middlepoint to be
  this.xAnchorPoint = xAnchorpoint;
  this.yAnchorPoint = yAnchorPoint;

  // This is meant to be a future anchorpoint that the current anchorpoint will move towards
  this.targetXAnchor = xAnchorpoint;
  this.targetYAnchor = yAnchorPoint;

  this.scattered = false;

  // Defines how far the bug will roam from AnchorPoints
  this.bugRange = 7;
  this.initialState = true;

  this.transparency = 2;

  // How long do we wait when bugs are scattered to increase transparency
  this.moveTimer = random(10, 300);

  // Start each bug at a different point in time along perlin path
  this.perlinXStartTime = random(0,10000);
  this.perlinYStartTime = random(0,10000);

  // Some bugs are faster, some slower
  this.bugXSpeed = random(0.005, 0.02);
  this.bugYSpeed = random(0.0005, 0.008);

  // Some bugs bigger, some smaller
  this.diameter = random(1, 5);

  this.attracted = false;

  this.move = function() {

    var perlinXValue = noise(this.perlinXStartTime);
    var perlinYValue = noise(this.perlinYStartTime);

    // bugXPos is the position of the bug within the box defined by xAnchorPoint/yAnchorPoint
    var bugXPos = map(perlinXValue, 0, 1, this.xAnchorPoint - this.bugRange, this.xAnchorPoint + this.bugRange);
    var bugYPos = map(perlinYValue, 0, 1, this.yAnchorPoint - this.bugRange, this.yAnchorPoint + this.bugRange);


    // If the mouse is close and scattered hasn't already been trigged, assign new target anchor
    if (dist(this.x, this.y, mouseX, mouseY) < 10 && this.scattered === false && this.initialState === false) {
      this.scattered = true;
      this.targetXAnchor = random(this.x-300, this.x+300);
      this.targetYAnchor = random(this.y-300, this.y+300);
    }

    if(this.scattered === false && this.initialState === false) {
      for (var i = 0; i < bugList.length; i++) {
        otherBug = bugList[i];
        if (otherBug.scattered === true && dist(otherBug.x, otherBug.y, this.x, this.y) < 4) {
          this.scattered = true;
          this.targetXAnchor = random(this.x-300, this.x+300);
          this.targetYAnchor = random(this.y-300, this.y+300);
        }
      }
    }

    if (this.scattered === true) {
      this.moveTimer--;
    }

    if (this.moveTimer < 1) {
      this.transparency--;
    }

    activeAnchorX = this.x;
    activeAnchorY = this.y;

    if(this.scattered === true) {

      // Shrinks the range of bugs slowly
      this.bugRange = (this.bugRange * .99) + (10 * 0.01);
    }

    this.xAnchorPoint = adjustAnchor(this.xAnchorPoint, this.targetXAnchor, 0.005);
    this.yAnchorPoint = adjustAnchor(this.yAnchorPoint, this.targetYAnchor, 0.005);

    this.x = bugXPos;
    this.y = bugYPos;

    this.perlinXStartTime += this.bugXSpeed;
    this.perlinYStartTime += this.bugYSpeed;
  };

  this.display = function() {

    if(this.initialState === true) {
      this.transparency = this.transparency * 1.04;
    }
    if (this.transparency > 250) {
      this.initialState = false;
    }

    stroke(bugOutline);
    currentDiameter = this.diameter;
    fill(100, 100, 100, this.transparency);
    ellipse(this.x, this.y, currentDiameter, currentDiameter);

  }
};