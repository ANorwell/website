
//The controller, initialized by setup();
var controller;

//resize function
var onresizeOld = window.onresize;
window.onresize = function() {
    if (onresizeOld) {
        onresizeOld();
    }
    controller.onResize(parent);
};



///////////
// Classes
///////////

//given a canvas, sets up the MVC
function setup( canvas) {
    parent = canvas.parentNode;
    G = new Graph();
    V = new View(G, canvas);
    controller = new Controller(V,G);
    V.setController(controller);

    var step = function() { V.draw()  }
    setInterval(step, 50)
}

function Controller(view, graph) {
    this.view = view;
    this.graph = graph;
    this.mouseDown = false;
    this.currVertex = null;
    this.mode = "vertex";


    //MOUSE DOWN
    this.mouseDownHandler = function(evt) {

        this.mouseDown = true;
        canvas = this.view.canvas;
        var mouseX = evt.pageX - canvas.offsetLeft;
        var mouseY = evt.pageY - canvas.offsetTop;

        
        switch (this.mode) {
            case "vertex":
                this.vertexHandler(mouseX, mouseY);
                break;
            case "edge":
                this.edgeHandler(mouseX, mouseY);
                break;
            default:
        }
    }


    //MOUSE UP
    this.mouseUpHandler = function (evt) {
        this.mouseDown = false;
    }

    
    //MOUSE MOVE
    this.mouseMoveHandler = function(evt) {
        if (! this.mouseDown ) {
            return;
        }

        if (this.currVertex !== null) {
            var v = this.graph.vertices[this.currVertex];
            
            var mouseX = evt.pageX- canvas.offsetLeft;
            var mouseY = evt.pageY - canvas.offsetTop;

            v.x = mouseX;
            v.y = mouseY;
        }
    }


    //VERTEX
    this.vertexHandler = function(mouseX, mouseY) {
        if ( mouseX > 0 && mouseY > 0 && mouseX < canvas.width && mouseY < canvas.height ) {
            
            //check to see if a vertex is selected
            var i = this.graph.getVertexNear(mouseX, mouseY, 2*this.view.vertexRadius);
            if (i !== null ) {
                this.currVertex = i;
            } else {
                this.graph.addVertex(mouseX, mouseY);
                this.currVertex = null;
            }
        }
    }


    //EDGE
    this.edgeHandler = function(mouseX, mouseY) {
        if ( mouseX > 0 && mouseY > 0 && mouseX < canvas.width && mouseY < canvas.height ) {
            //check to see if a vertex is selected
            var i = this.graph.getVertexNear(mouseX, mouseY, 2*this.view.vertexRadius);
            if (i !== null) {

                var v = this.graph.vertices[i];
                if (this.currVertex !== null && this.currVertex !== i) {
                    this.graph.addEdge(this.graph.vertices[this.currVertex], v);
                }

                this.currVertex = i;
            }
        }
    }


    //ONRESIZE
    this.onResize = function(parent) {
        this.view.canvas.width = parent.offsetWidth - 10; //TODO should be style.paddingLeft + style.paddingRight but this doesn't work ?
    }


    //BUTTON CLICK
    this.buttonHandler = function(buttonType) {
        this.mode = buttonType;
        this.currVertex = null;
    }               
}

function View(graph, canvas) {
    this.graph = graph;
    this.canvas = canvas;
    this.controller = null;;

    this.vertexRadius = 5;
    this.border = 5;

    this.setController = function(cont) {
        this.controller = cont;
    }

    //Draw the graph
    this.draw = function() {
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0,0, this.canvas.width, this.canvas.height);

        //draw vertices
        for (var i=0; i<this.graph.vertices.length; i++) {
            var v = this.graph.vertices[i];

            ctx.beginPath();

            //color
            if (i == this.controller.currVertex) {
                ctx.strokeStyle = '#f00';
            }

            ctx.arc(v.x, v.y, this.vertexRadius, 0, 10, false);
            ctx.stroke();
            ctx.closePath();

            //reset color
            ctx.strokeStyle = '#000000';
        }

        //draw edges
        for (var i=0; i<this.graph.edges.length; i++) {
            var e = this.graph.edges[i];
            ctx.beginPath();
            ctx.moveTo(e.v1.x, e.v1.y);
            ctx.lineTo(e.v2.x, e.v2.y);
            ctx.stroke();
        }
    }
}

function Vertex(x,y) {
    this.x = x;
    this.y = y;

    this.toString = function() { return "(" + this.x + "," + this.y + ")" };
}

function Edge(v1, v2) {
    this.v1 = v1;
    this.v2 = v2;
}

function Graph() {
    this.vertices = new Array();
    this.edges = new Array();

    //Add a vertex
    this.addVertex = function(x,y) {

        var v = new Vertex(x,y);
        this.vertices.push(v);
    }

    //Add an edge
    this.addEdge = function(v1,v2) {
        var e = new Edge(v1,v2);
        this.edges.push(e);
    }

    //Get vertex near a point
    this.getVertexNear = function(x,y, dist) {
        for (var i=0; i<this.vertices.length; i++) {

            var v = this.vertices[i];
            if ( (v.x - x) < dist && (x - v.x) < dist && (v.y - y) < dist && (y - v.y) < dist ) {
                return i;
            }
        }
        return null;
    }
}
