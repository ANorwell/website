
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

//the id of the wrapper element that contains content.
gWrapper = '#wrapper';

//The suffix appended to the the page title when a single post is displayed.
gTitleSuffix = " - Arron Norwell";

function drawMenu() {
    document.write( '  <div class="menu" id="menu">  ');
    document.write( ' <a href = "index.html">');
    document.write( '      <canvas id="canvas" width="150" height="150" class="logo"></canvas>');
    document.write( '</a>');
    document.write('<script type="text/javascript" src="js/canvas.js"></script>'); 
    //document.write( '      <a id="canvasSize" onClick="canvasSize()">+</a>' );

    document.write( '      <br/> ' )

        document.write( '      <a class="menutext" href="index.html">Blog</a><br/> ');
    document.write( '      <a class="menutext" href="listen.html">Music</a><br/> ');
    document.write( '      <a class="menutext" href="projects.html">Projects</a><br/> ');
    document.write( '      <a class="menutext" href="about.html">About</a><br/> ');
    document.write( '    <br/> ');
    document.write( '  </div> ');
}

function drawHeader() {
    document.write('<div class="bigtitle" id="header">Arron Norwell</div>');
}


//Should get called after anything else that inserts
//content into wrapper.
function drawFooter() {
    $(gWrapper).append('<div class="footerpad"></div>');
    $('body').append('<div class="footer">Content (C) <a href="mailto:anorwell@gmail.com">Arron Norwell.</a>.  This website is on <a href="http://github.com/ANorwell/website">github.</a></div>');
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

//When the server returns content, updates the page to show the new content.
//Should be the onreadystatechange of an XMLHttpRequest.
function processContentCallback() {
    if ( (this.readyState == 4) && (this.status == 200) ) { //completed OK
        var data = JSON.parse(this.responseText);

        if ( data.length ) {
            
            for(var post in data) {
                var postHtml;
                var curPost = data[post];
                    
                if (curPost.title) { //it is a post
                    postHtml = getPostHtml( curPost.title, curPost.date, curPost.type,
                                            curPost.content, curPost.id);
                    $("#content").append(postHtml);    

                    //if this is a single post, set the title.
                    if (getParams()["id"]) {
                        document.title = curPost.title + gTitleSuffix;
                    }
                }
            }
        } else { //no new posts
            $('#allposts').html("No More Posts");
        }
    }
}

//Construct a XMLHttpRequest to get content from the server
function getContent(tag, max) {
    max = max || 5;
    var req = new XMLHttpRequest();
    req.onreadystatechange = processContentCallback;

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
        var months = new Array("Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec");

        return months[date.getMonth()] + " "
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
//optional tag provided.
function emitEndOfPage(tag) {
    var id = getParams()["id"];
    if (id) {
        emitComments(id);
    } else {
        emitMoreLink(tag);
    }
}

function emitMoreLink(aTag) {
    var tag = aTag || "";
    $(gWrapper).append('<div id="allposts" class="allposts"></div>')
        $('#allposts').append('<a href="javascript:getContent(\'' + tag + '\')">More</a>');
}

//emits html to display facebook comments
//http://developers.facebook.com/docs/reference/fbml/comments_%28XFBML%29
function emitComments(id) {
    
    if (id) {
        $(gWrapper).append(
            '<div class="comments">' +
            ' <fb:comments xid=' + id + '></fb:comments>' +
            '</div>'
                         );

        //initialize the FB api using the api key
        FB.init("13b8ea6ba64ec33d0c1c9c6f0b4712af", "/xd_receiver.htm");
    }
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

//some (remote) scripts use document.write, which doesn't play
//nice with ajax. embed overrides document.write and then
//inserts the script tag, so that document.write appends to
//the selected id instead of the end of the page.
//To stop multiple calls to embed from colliding, the function
//is locked while a <script> tag is being processed.
var gEmbedLock = false;
var gEmbedSleepDuration = 50;

function embed(jsPath, id) {
    if (gEmbedLock) {
        setTimeout(function() {embed(jsPath,id)}, 50);
    } else {
        gEmbedLock = true;

        document.oldwrite = document.write;
        document.write = function(string) {
            $("#" + id).append(string);
        };

        //use non-jquery because jquery processes script tags...
        var head = document.getElementsByTagName("head")[0];
        var js = document.createElement('script');
        js.type = 'text/javascript';
        js.src = jsPath;
        js.onload = function() {
            document.write = document.oldwrite;
            gEmbedLock = false;
        }
                                 
        head.appendChild(js);
    }
}
