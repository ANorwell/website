document.write( '  <div class="menu" id="menu">  ');
document.write( ' <a href = "index.html">');
document.write( '      <canvas id="canvas" width="150" height="150" class="logo"></canvas>');
document.write( '</a>');
document.write('<script type="text/javascript" src="js/canvas.js"></script>'); 
document.write( '      <a id="canvasSize" onClick="canvasSize()">+</a>' );

document.write( '      <br/> ' );
document.write( '      <a class="menutext" href="graphics.html">Graphics</a><br/> ');
document.write( '      <a class="menutext" href="webgl.html">Webgl</a><br/> ');
document.write( '      <a class="menutext" href="music.html">Music</a><br/> ');
document.write( '      <a class="menutext" href="canvas.html">HTML Canvas</a><br/> ');
document.write( '      <a class="menutext" href="graph.html">Graph Drawing</a> ');
document.write( '    <br/> ');
document.write( '  </div> ');


//set the default canvas size
gCanvasHeight = 150;
gCanvasWidth = 150;

function canvasSize() {
    var c = document.getElementById('canvas');
    
    c.height = (c.height == 150) ? 500 : 150;
    c.width = (c.width == 150) ? 500 : 150;
    var newWidth = (c.width + 40) + 'px';
    document.getElementById('menu').style.width = newWidth;

    var mains = document.getElementsByClassName('main');
    for (var i=0; i<mains.length; i++) {
        mains[i].style.marginLeft = (c.width + 60) + 'px';
    }
    document.getElementById('canvasSize').innerHTML = (c.width == 150) ? '+' : '-';

}
    
