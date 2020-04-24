//borrows a lot from nehe

function Globals() {
    //Properties
    this.height = 500;
    this.width = 500;
}

var Globals = new Globals();

function getHeight() { return Globals.height; }
function getWidth() { return Globals.width; }

function glStart() {
    var canvas = document.getElementById("webgl");
    initGL(canvas);
    initShaders();
    initBuffers();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    setInterval(drawScene, 15);

}

var shape;
function initBuffers() {
    shape = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, shape);
    var vertices = [
        0.0,  1.0,  -1.0,
        -1.0, -1.0,  -1.0,
        1.0, -1.0,  -1.0
                    ];
    gl.bufferData(gl.ARRAY_BUFFER, new WebGLFloatArray(vertices), gl.STATIC_DRAW);
    shape.itemSize = 3;
    shape.numItems = 3;
}

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    perspective(45, 1.0, 0.1, 100.0);
    loadIdentity();

    gl.bindBuffer(gl.ARRAY_BUFFER, shape);
    gl.vertexAttribPointer(vertexPositionAttribute, shape.itemSize, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, shape.numItems)

}
    
var gl;
function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
    } catch (e) {}

    //Try some other context names...
    if (!gl) {
        try {
            gl = canvas.getContext("webkit-3d");
        } catch (e) {}
    }

    //Firefox
    if (!gl) {
        try {
            gl = canvas.getContext("moz-webgl");
        } catch(e) {}
    }

    //2d context error
    if (!gl) {
        try {
            gl = canvas.getContext('2d');
            gl.fillText('Canvas supported, but could not get webgl 3d context',
                        10, 10);
        } catch(e) {}
    }

    //using ie or something
    if (!gl) {
        alert("Could not initialise WebGL.  Use a chrome or firefox nightly.");
    }
}

var shaderProgram;
var vertexPositionAttribute;
function initShaders() {
    var fragmentShader = getShader(gl, "fragment-shader");
    var vertexShader = getShader(gl, "vertex-shader");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
    
    gl.useProgram(shaderProgram);
    
    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
}

  function getShader(gl, id) {
      var shaderScript = document.getElementById(id);
      if (!shaderScript) {
          alert("Couldn't get shader element from page");
          return null;
      }

      var str = "";
      var k = shaderScript.firstChild;
      while (k) {
          if (k.nodeType == 3)
              str += k.textContent;
          k = k.nextSibling;
      }

      var shader;
      if (shaderScript.type == "x-shader/x-fragment") {
          shader = gl.createShader(gl.FRAGMENT_SHADER);
      } else if (shaderScript.type == "x-shader/x-vertex") {
          shader = gl.createShader(gl.VERTEX_SHADER);
      } else {
          alert("couldn't create shader");
          return null;
      }

      gl.shaderSource(shader, str);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert(gl.getShaderInfoLog(shader));
          return null;
      }

      return shader;
  }

//Perspective matrix
var pMatrix;
function perspective(fovy, aspect, znear, zfar) {
    pMatrix = makePerspective(fovy, aspect, znear, zfar);
}

//Todo: modelview

function loadIdentity() {
    pMatrix = Matrix.I(4);
}
