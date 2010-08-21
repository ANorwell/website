
//GLOBALS
//set the default canvas size for the menu
gCanvasHeight = 150;
gCanvasWidth = 150;

gServerUTCDifference = 240;

function drawMenu() {
    document.write( '  <div class="menu" id="menu">  ');
    document.write( ' <a href = "index.html">');
    document.write( '      <canvas id="canvas" width="150" height="150" class="logo"></canvas>');
    document.write( '</a>');
    document.write('<script type="text/javascript" src="js/canvas.js"></script>'); 
    //document.write( '      <a id="canvasSize" onClick="canvasSize()">+</a>' );

    document.write( '      <br/> ' )

        document.write( '      <a class="menutext" href="index.html">Read</a><br/> ');
    document.write( '      <a class="menutext" href="listen.html">Listen</a><br/> ');
    document.write( '      <a class="menutext" href="look.html">Look</a><br/> ');
    document.write( '      <a class="menutext" href="code.html">Code</a><br/> ');
    document.write( '      <a class="menutext" href="about.html">About</a><br/> ');
    document.write( '    <br/> ');
    document.write( '  </div> ');
}

function drawHeader() {
    document.write('<div class="headerbox" id="header" style="text-align:center"><h1 style="font-size:2em;font-family:Georgia,serif">Arron Norwell</h1></div>');
}


//no-op, for now.
function drawFooter() {
    //document.write('<div class="footer">Content (C) <a href="mailto://anorwell@gmail.com">Arron Norwell.</a>.  This website is on <a href="http://github.com/ANorwell/website">github.</a></div>');
}

//resizes the menu canvas when clicked.  not used anymore because its stupid
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
    

function postContent() {
    var form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", "content.py");
    //set inputs
    form.submit();
}

function getContent() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if ( (req.readyState == 4) && (req.status == 200) ) { //completed OK
            var data = JSON.parse(req.responseText);

            for(var post in data) {
                var postHtml;
                var curPost = data[post];
                console.log(curPost);

                if (curPost.title) { //it is a post and not a comment
                    postHtml = getPostHtml( curPost.title, curPost.date, curPost.type,
                                            curPost.content);
                    console.log("got post " + postHtml);
                    $("#content").append(postHtml);    
                }
            }
        }
    }
    
    req.open("GET", "content.py", true);
    req.send("");
}

//transforms an iso datestring to one in the user's timezone.
function toUserDate(isoDate) {
    
    //the user's timezone offset in minutes
    var tzOffset = new Date().getTimezoneOffset() - gServerUTCDifference;

    // iso: 2010-08-15T01:11:00
    var regex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/;
    var d = isoDate.match(regex);
    console.log("isodate: ", isoDate, "tzoffset", tzOffset);
    console.log("toUserDate: ", d[0], d[1], d[2], d[3], d[4], d[5]);

    if (d) {
        var date = new Date(d[1], d[2] - 1, d[3], d[4], d[5]- tzOffset, d[6]);
        var months = new Array("Jan", "Feb", "Mar", "Apr", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec");

        return months[date.getMonth()-1] + " "
            + date.getDate() + ", "
            + date.getFullYear() + " "
            + date.getHours() + ":"
            + (date.getMinutes() < 10 ? "0" : "" )
            + date.getMinutes();
    }
    return 0;
}   

function getPostHtml(title, date, type, content) {

    date = toUserDate(date);
    return "<div class=\"main\">\n" +
        "<div class=\"titleblock\">" +
        "<h1 class=\"title\">" + title + "</h1>\n" +
        "<h3 class=\"date\">" + date + "<br/>" + type + "</h3>\n" +
        "</div>\n" +
        content +
        "</div>\n";
}
    

//given a post id, filters just the associated comments
function getCommentsForId(data, id) {
    var comments = [];
    for(var post in data) {
        if (data[post].post_id == id) {
            comments.push(post);
        }
    }
    return comments;
}
    
    
