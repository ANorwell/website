
//Ideally each

var gNumberWidgets = 3;

function init(canvas){
  if(canvas.getContext('2d')) {
    var rand = Math.floor(Math.random()*gNumberWidgets);
    drawWidget(rand,canvas);
  } else {
    alert('This browser doesn\'t support the canvas element -- HTML 5 required.');
  }
}

function drawWidget(index, canvas) {
  switch (index) {
    case 0:
      var clockStep = function() { clock(canvas) }
      clockStep();
      setInterval(clockStep,1000);
      break;
    case 1:
      var walk = new WalkContext(canvas);
      var walkStep = function() { randomWalk(canvas, walk) }
      setInterval(walkStep, 50);
      break;
    case 2:
      var t = new Tetris();
      var tStep = function() { t.tetrisStep(canvas) }
      setInterval(tStep, t.timeStep);
      break;
    default:
  }
}

function getTitle(index) {
  switch (index) {
    case 0:
      return "Clock";
      break;
    case 1:
      return "Stingrays";
      break;
    case 2:
      return "Tetris";
      break;
    default:
      return "Not defined";
  }
}

function getDescription(index) {
  switch(index) {
    case 0:
      return 'This is a slightly modified canvas clock that was created by <a href="http://labs.mininova.org/canvas">http://labs.mininova.org/canvas</a> . It helped start me on this canvas thing.';
      break;
    case 1:
      return 'The position and motion of each fish is determined randomly.';
      break;
    case 2:
      return 'Blocks fall in an evenly distributed fashion.  Notice that the row which is empty will change regularly.';
      break;
    default:
      return "unknown index";
  }
}

function contentPostAllWidgets() {
  for (var i=(gNumberWidgets-1); i>=0; i--){
    var id = 'canvas' + i;
    document.write('<div class="main">');
    document.write('<h2>' + getTitle(i) + '</h2>');
    document.write('<canvas class="logo" width="500" height="500" id="' + id + '"></canvas></br>');
    document.write('<p>' + getDescription(i) + '</p>');
    document.write('</div>');
    var canvas = document.getElementById(id);
    drawWidget(i, canvas);
    
  }
}


/////////////////////////////////
// Clock, stolen from someone
/////////////////////////////////
//  code from http://labs.mininova.org/canvas/
//  Requires width = height (or, takes width in all cases as the size)
//  Modified by me to be dynamically sized.
function clock(canvas){
  var now = new Date();
  width = canvas.width;
  height = canvas.height;
  
  var ctx = canvas.getContext('2d');
  ctx.save();
  ctx.clearRect(0,0,width,height);
  ctx.translate(width/2, height/2);
  ctx.scale(0.4,0.4);
  ctx.rotate(-Math.PI/2);
  ctx.strokeStyle = "black";
  ctx.fillStyle = "white";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";

  // Hour marks
  ctx.save();
  ctx.beginPath();
  for (var i=0;i<12;i++){
    ctx.rotate(Math.PI/6);
    ctx.moveTo(2*width/3,0);
    ctx.lineTo(3*width/4,0);
  }
  ctx.stroke();
  ctx.restore();

  // Minute marks
  ctx.save();
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (i=0;i<60;i++){
    if (i%5!=0) { // 5 minutes
      ctx.moveTo(3*width/4 - 3,0);
      ctx.lineTo(3*width/4,0);
    }
    ctx.rotate(Math.PI/30);
  }
  ctx.stroke();
  ctx.restore();
  
  var sec = now.getSeconds();
  var min = now.getMinutes();
  var hr  = now.getHours();
  hr = hr>=12 ? hr-12 : hr;

  ctx.fillStyle = "black";

  // write Hours
  ctx.save();
  ctx.rotate( hr*(Math.PI/6) + (Math.PI/360)*min + (Math.PI/21600)*sec )
    ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(-2/15*width,0);
  ctx.lineTo(8/15*width,0);
  ctx.stroke();
  ctx.restore();

  // write Minutes
  ctx.save();
  ctx.rotate( (Math.PI/30)*min + (Math.PI/1800)*sec )
    ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(-28/150*width,0);
  ctx.lineTo(112/150*width,0);
  ctx.stroke();
  ctx.restore();
  
  // Write seconds
  ctx.save();
  ctx.rotate(sec * Math.PI/30);
  ctx.strokeStyle = "#D40000";
  ctx.fillStyle = "#D40000";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-30/150*width,0);
  ctx.lineTo(83/150*width,0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0,0,1/15*width,0,Math.PI*2,true);
  ctx.fill();
  ctx.beginPath();
  //ctx.arc(95/150*width,0,1/15*width,0,Math.PI*2,true);
  ctx.stroke();
  ctx.fillStyle = "#555";
  ctx.arc(0,0,3,0,Math.PI*2,true);
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#325FA2';
  ctx.arc(0,0,width - 8,0,Math.PI*2,true);
  ctx.stroke();

  ctx.restore();
}

/////////////////////////////
//  RandomWalk
/////////////////////////////

//TODO this would be cooler if the 2nd derivative of angle changed randomly.


function WalkContext(canvas) {
  this.count = 20;
  this.guys = new Array();
  this.canvas = canvas;
  this.width = canvas.width;
  this.height = canvas.height;

  for (var i=0; i < this.count; i++) {
    this.guys[i] = new WalkGuy(this.width,this.height);
  }
}
                   
function WalkGuy(width,height) {
  var x = 1;
  var y = 1;
  while ( x > 0 && x < width ) {
    x = Math.floor(Math.random()*(width+100)) - 50;
  }

  while ( y > 0 && y < height ) {
    y = Math.floor(Math.random()*(height+100)) - 50;
  }
  this.x = x;
  this.y = y;

  //Look towards the screen, but with some randomness.
  var dx = width/2 -x;
  var dy = height/2 - y;
  this.dir = Math.atan2(dy,dx) + (Math.random()*Math.PI/5 - Math.PI/10);

  //want infrequent big guys, on range [10, 50]
  //so choose in log-space.
  var min = Math.log(0.2);
  var max = Math.log(40.2);
  var spawn = Math.random()*(max - min) + min;
  this.size = Math.exp(spawn) + 9.8;

  //smaller = faster, maneuverable
  this.stepSize = Math.max(1, Math.ceil((50 - this.size)/10));
  this.dAngle = (50 - this.size)/50*Math.PI/7;

  var r = Math.floor(Math.random()*255);
  var g = Math.floor(Math.random()*255);
  var b = Math.floor(Math.random()*255);
  this.col_str = "rgb(" + r + "," + g + "," + b + ")";
    
}

function drawGuy(ctx,guy) {
  ctx.save();

  //color
  ctx.fillStyle = guy.col_str;
  var x = guy.x;
  var y = guy.y;
  ctx.beginPath();
  ctx.translate(x,y);
  ctx.rotate(guy.dir);

  //guy is looking at coordinate (1,1) instead of (1,0);
  ctx.rotate(-45/180*Math.PI);
    
  //tail
  ctx.save();
  ctx.strokeStyle = guy.col_str;
  ctx.rotate(Math.PI);
  ctx.moveTo(0,0);

  //map [0,pix) to (-20, 20)*pi/180, starting and ening at 0 (so pix/2 => 20)
  var pix = guy.size;
  var tailpos = (guy.x % pix + guy.y % pix ) % pix;
  var max_move = 35;
    
  var ang;
  if (tailpos <= pix/2) {
    ang = ((pix/2-tailpos)*(-max_move) + tailpos*max_move )/pix*2*Math.PI/180;
  } else {
    ang = ((tailpos-pix/2)*(-max_move) + (pix-tailpos)*(max_move) )/pix*2*Math.PI/180;
  }
  ctx.rotate(ang);
  ctx.arcTo(guy.size/3,guy.size/4, guy.size/3, guy.size/3, guy.size/5); //what the hell does this do
  ctx.stroke();
  ctx.restore(); //tail is done
    
  ctx.moveTo(0,0);
  ctx.lineTo(guy.size, 0);
  ctx.arc(0,0,guy.size,0,Math.PI/2,false);
  ctx.moveTo(0,guy.size);
  ctx.lineTo(0,0);
  ctx.fill();

  //eyes
  ctx.fillStyle = "rgb(0,0,0)";
  var eye_x = Math.floor(0.75*guy.size);
  ctx.rotate(25*Math.PI/180);
  ctx.fillRect(eye_x-1,0, 2,2);
  ctx.rotate(30*Math.PI/180);
  ctx.fillRect(eye_x-1,0, 2,2);


  ctx.restore();
}

function randomWalk(canvas,walk) {
  var ctx = canvas.getContext('2d');
  walk.width = canvas.width;
  walk.height = canvas.height;
  ctx.clearRect(0,0,walk.width, walk.height);

  for (var i=0; i< walk.count; i++) {
    var guy = walk.guys[i];

    //if he's off the larger screen, respawn
    if ( (guy.x < -50) || (guy.x > (walk.width + 50))) {
      delete guy;
      walk.guys[i] = new WalkGuy(walk.width, walk.height);
      guy = walk.guys[i];
    }
    if ( (guy.y < -50) || (guy.y > (walk.height + 50))) {
      delete guy;
      walk.guys[i] = new WalkGuy(walk.width, walk.height);
      guy = walk.guys[i];
    }

    //random walk
    guy.dir = guy.dir + Math.random()*guy.dAngle - guy.dAngle/2;
    guy.x += Math.cos(guy.dir)*guy.stepSize;
    guy.y += Math.sin(guy.dir)*guy.stepSize;

    drawGuy(ctx,guy);
  }

}


////////////////////////
// (sqare) Tetris
////////////////////////

function Tetris(canvas) {
  this.gridSize = 20; // row 0 is at the BOTTOM.
  this.blockRegularity = 5; //block falls every this many steps
  this.timeStep = 20;
  this.currentStep = 0;
  this.grid = new Array(this.gridSize + 1); //6th row hidden
  this.color = new Array(this.gridSize);
  for( var i=0; i<this.grid.length; i++ ) {
    this.grid[i] = new Array(this.gridSize);
    for( var j=0; j<this.grid[i].length; j++ ) {
      this.grid[i][j] = 0;
    }
  }
}

Tetris.prototype.tetrisStep = function(canvas) {

    //remove rows
  for( var i=0; i<this.grid.length-1; i++ ) {
    var count = 0;
    for( var j=0; j< this.grid[i].length; j++ ) {
      if (this.grid[i][j]) {
        count = count + 1;
      }
    }
    
    if (count == this.grid[i].length) {
        for( var j=0; j< this.grid[i].length; j++ ) {
          this.grid[i][j] = 0;
        }
    } else {
      break;
    }
  }

  //move everything down one
  for( var i=1; i<this.grid.length; i++ ) {
    for( var j=0; j< this.grid[i].length; j++ ) {
      if (this.grid[i][j] && !this.grid[i-1][j]) {
        this.grid[i-1][j] = 1;
        this.grid[i][j] = 0;
      }
    }
  }
  
  //set color
  for( var i=0; i<this.grid.length-1; i++ ) {
    var count = 0;
    for( var j=0; j< this.grid[i].length; j++ ) {
      if (this.grid[i][j]) {
        count = count + 1;
      }
    }
    this.color[i] = Math.floor(count * 255 / this.grid[i].length);
  }
  
  //spawn a block randomly
  var rand = Math.floor(Math.random()*this.gridSize );
  this.grid[this.gridSize][rand] = 1;
  
  this.tetrisDraw(canvas);
  this.currentStep = this.currentStep + 1;
}

Tetris.prototype.tetrisDraw = function(canvas) {
  var ctx = canvas.getContext('2d');

  ctx.clearRect(0,0,canvas.width,canvas.height);
  
  var border = 5;
  var width = (canvas.width - 2*border)/this.gridSize;
  
  for( var i=0; i<this.grid.length-1; i++ ) {
    var iPos = this.grid.length - 2 - i;
    var col = "rgb(0," + this.color[i] + ",0)";
    ctx.fillStyle = col;
    for( var j=0; j<this.grid[i].length; j++ ) {
      if (this.grid[i][j]) {
        ctx.fillRect(border + j*width, border + iPos*width, width, width);
      }
    }
  }
}


///////////////////////
/// call main for the logo
//////////////////////

init(document.getElementById('canvas'));
