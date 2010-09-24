
//GLOBALS
//set the default canvas size for the menu
gCanvasHeight = 150;
gCanvasWidth = 150;

//How far the server is in minutes from UTC.
//TODO: breaks for savings time? 
gServerUTCDifference = 240;

//Multiple calls to getContent will increment gFirstPost, so that
//each call will get the next (older) batch of posts.
gFirstPost = 0;

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


//Post content to content.py.
//Note that this can also be done in html, and this method is not currently used.
function postContent() {
    var form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", "content.py");
    //TODO set inputs
    form.submit();
}

function getContent(tag, max) {
    max = max || 5;
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if ( (req.readyState == 4) && (req.status == 200) ) { //completed OK
            var data = JSON.parse(req.responseText);

            if ( data.length ) {
            
                for(var post in data) {
                    var postHtml;
                    var curPost = data[post];
                    
                    if (curPost.title) { //it is a post
                        postHtml = getPostHtml( curPost.title, curPost.date, curPost.type,
                                                curPost.content, curPost.id);
                        $("#content").append(postHtml);    
                    }
                }
            } else { //no new posts
                $('#allposts').html("No More Posts");
            }
        }
    }

    var params = getParams();
    var queryString = "?";
    if (gFirstPost) {
        queryString += "first=" + gFirstPost + "&";
    }
    if (tag) {
        queryString += "tag=" + tag + "&";
    }
    if (max) {
        queryString += "maxposts=" + max + "&";
    }
    for (key in params) {
        queryString += key + "=" + params[key] + "&";
    }
    queryString = queryString.replace(/&$/, "");

    req.open("GET", "content.py" + queryString, true);
    req.send("");
    gFirstPost += max;
}

//transforms an iso datestring to one in the user's timezone.
function toUserDate(isoDate) {
    
    //the user's timezone offset in minutes
    var tzOffset = new Date().getTimezoneOffset() - gServerUTCDifference;

    // iso: 2010-08-15T01:11:00
    var regex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/;
    var d = isoDate.match(regex);

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

function getPostHtml(title, date, type, content, id) {

    date = toUserDate(date);
    return "<div class=\"main\">\n" +
        "<div class=\"titleblock\">" +
        "<h1 class=\"title\">" +
        "<a href=\"index.html?id="+
        id +
        "\">" +
        title +
        "</a>" +
        "</h1>\n" +
        "<h3 class=\"date\">" +
        date +
        "<br/>" +
        type +
        "</h3>\n" +
        "</div>\n" +
        content +
        "</div>\n";
}

//display either comments or link to get more posts,
// depending on context
function emitEndOfPage() {
    var id = getParams()["id"];
    if (id) {
        emitComments(id);
    } else {
        emitMoreLink();
    }
}

function emitMoreLink() {
    $('body').append('<div id="allposts" class="allposts"></div>')
        $('#allposts').append('<a href="javascript:getContent()">More</a>');
}

//emits html to display facebook comments
//http://developers.facebook.com/docs/reference/fbml/comments_%28XFBML%29
function emitComments(id) {
    
    if (id) {
        $('body').append(
            '<div class="comments">' +
            ' <fb:comments xid=' + id + '></fb:comments>' +
            '</div>'
                         );

        //initialize the FB api using the api key
        FB.init("13b8ea6ba64ec33d0c1c9c6f0b4712af", "/xd_receiver.htm");
    }
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


//helper to get param pairs from query string
function getParams() {
    var params = {};
    var url = parent.document.URL;

    if (url.match(/\?/)) {
        var pairs = url.replace(/#.*$/, '').replace(/^.*\?/, '').split(/[&;]/);
        for (var p in pairs) {
            var keyPair = pairs[p].split(/=/);
            params[keyPair[0]] = keyPair[1];
        }
    }
    return params;
}

