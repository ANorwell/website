
console.log = function() {};

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
function setup( canvas ) {
    parent = canvas.parentNode;
    G = new Graph();
    V = new View(G, canvas);
    controller = new Controller(V,G);
    V.setController(controller);

    var physics = new Physics(G);
    physics.setPhysicsMode("float");

    
    var step = function() { V.draw()  }
    setInterval(step, 50)
}

/*
 *   Controller
 */

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

            this.graph.moveVertex(v, mouseX, mouseY);
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
                if (this.currVertex !== null &&
                    this.currVertex !== i &&
                    !this.graph.hasEdge(this.graph.vertices[this.currVertex], this.graph.vertices[i]) ) {
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


///test crap
Controller.prototype.itrCurrentVertex = function() {
    this.graph.startDepthFirst(this.graph.vertices[this.currVertex]);
    for (var v in this.graph) {
        console.log("Iterated over", v.toString());
    }
}

/*
 *     View
 */

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
    this.marked = false;   //for iteration.
    this.edges = new Array();
    this.toString = function() { return "(" + this.x + "," + this.y + ")" };
}

Vertex.prototype.__iterator__ = function() {
    return new VertexIterator(this);
};

//marks this vertex and iterates over unmarked neighbours
function VertexIterator(v) {
    this.v = v;
};

VertexIterator.prototype.next = function() {

    //return first unmarked neighbour
    for (edgeIndex in this.v.edges) {
        var e = this.v.edges[edgeIndex];
        var other;
        if (e.v1 != this.v) {
            other = e.v1;
        } else {
            other = e.v2;
        }
        if (!other.marked) {
            console.log("VertexIterator returning", other.toString());
            other.marked = true;
            return other;
        }
    }
    throw StopIteration;
}

function Edge(v1, v2) {
    this.v1 = v1;
    this.v2 = v2;
}

/*
 *    Graph
 */
function Graph() {
    this.vertices = new Array();
    this.edges = new Array();
}

//Add a vertex
Graph.prototype.addVertex = function(x,y) {
    var v = new Vertex(x,y);
    this.vertices.push(v);
};

//Add an edge
Graph.prototype.addEdge = function(v1,v2) {
    var e = new Edge(v1,v2);
    this.edges.push(e);
    v1.edges.push(e);
    v2.edges.push(e);
};

//Get vertex near a point
Graph.prototype.getVertexNear = function(x,y, dist) {
    for (var i=0; i<this.vertices.length; i++) {
        
        var v = this.vertices[i];
        if ( (v.x - x) < dist && (x - v.x) < dist && (v.y - y) < dist && (y - v.y) < dist ) {
            return i;
        }
    }
    return null;
};

Graph.prototype.hasEdge = function(va, vb) {
    for (var e in va.edges) {
        //since e is in va.edges, either v1 or v2 is va
        if (e.v1 == vb || e.v2 == vb) {
            return true;
        }
    }
    return false;
};

Graph.prototype.startDepthFirst = function (v) {
    for (var i in this.vertices) {
        this.vertices[i].marked = false;
    }

    //items of itrStack should be marked.
    this.itrStack = new Array();
    this.itrStack.push(v);
    v.marked = true;
};

Graph.prototype.__iterator__ = function() {
    return new GraphIterator(this);
};

//GraphIterator for depthfirst iteration from a given vertex,
//as set by graph.startDepthFirst(vertex);
function GraphIterator(graph) {
    this.g = graph;
}

GraphIterator.prototype.next = function() {
    var currVertex = this.g.itrStack.pop();
    if (!currVertex) {
        throw StopIteration;
    }

    for (var neighbour in currVertex) {
        console.log("Pushing", neighbour.toString());
        this.g.itrStack.push(neighbour);
    }
    console.log(this.g.itrStack.length, "is stack size, returning ", currVertex.toString());
    return currVertex;
};

/*
  Function that defines what happens when a vertex is moved.
  This function is controlled by the Physics class, which modifies this callback
  for the Graph object provided to physics:
  var p = new Physics(graph);
  p.setPhysicsMode("float");
 */    
Graph.prototype.moveVertex = function(vertex, x, y) {
    vertex.x = x;
    vertex.y = y;
};

/*
 *    Physics
 */
function Physics(graph) {
    this.graph = graph;

    //Map physics mode names to their callbacks
    this.modes = {
        "default" : this.defaultMove,
        "float" : this.floatMove
    };
}

Physics.prototype.defaultMove = function(vertex, x, y) {
    vertex.x = x;
    vertex.y = y;
};

Physics.prototype.floatMove = function(vertex, x, y) {
    var dx = x - vertex.x;
    var dy = y - vertex.y;
    
    //move this vertex
    vertex.x += dx;
    vertex.y += dy;
    
    //move other vertices in this component
    this.startDepthFirst(vertex);
    for (var v in this) {
        console.log(v.toString(), "connected to", vertex.toString());
        if (v != vertex) {
            v.x = v.x + dx/2;
            v.y = v.y + dy/2;
        }
    }
    
    console.log("dx is", dx, "dy is: ", dy);
};

Physics.prototype.setPhysicsMode = function(aMode) {
    var match = false;
    for (var mode in this.modes) {
        if (aMode == mode) {
            this.graph.moveVertex = this.modes[mode];
            match = true;
        }

    }

    if (!match) {
        console.log("Mode", aMode, "not recognized!");
    }
};
