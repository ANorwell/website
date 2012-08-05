<?php

#Sensitive information stored in a config file
$gConfigFileLocation = "config.txt";

$fh = file($gConfigFileLocation,FILE_IGNORE_NEW_LINES);
foreach ($fh as $line) {
  if (preg_match("/^#|^\s*$/", $line) == 0) {
    list ($k,$v) = preg_split("/\s*=\s*/", $line);
    $gConfig[$k] = $v;
  }
}


//the meta info for the page and post
$gPageTitle = "Arron Norwell";
$gKeywords = "arron,norwell,arron norwell";
$gMeta = array(
               keywords => "arron,norwell,arron norwell",
               "fb:admins" => "632644359",
               "fb:app_id" => "142482435788660",
               "og:type" => "anorwell:post",
               "og:image" => "http://anorwell.com/icon.gif"
               );

$link = mysql_connect($gConfig['host'], $gConfig['user'], $gConfig['dbPw']);

if (!$link) {
    die('Could not connect: ' . mysql_error());
 }

mysql_select_db($gConfig['db']);

function getPost($filter) {
    return mysql_query("SELECT id,title,content,date,type FROM post WHERE $filter ORDER BY id DESC LIMIT 0 , 5");
}

if ($_GET["id"]) {
    $post = getPost("id = $_GET[id]");
 } else {
    $post = getPost(1);
 }

if (!$post) {
    die('Invalid query: ' . mysql_error());
}

//Process the first row, so we can use it in the head.
$row = mysql_fetch_assoc($post);
if ($_GET["id"]) {
    $gPageTitle = "$row[title] - Arron Norwell";
    $gMeta["keywords"] .= "," . $row["type"];
    $gMeta["og:url"] = "http://anorwell.com/?id=" . $_GET['id'];
    $gMeta["og:title"] = $gPageTitle;
}    
                      
?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:fb="http://www.facebook.com/2008/fbml">
  <head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# anorwell: http://ogp.me/ns/fb/anorwell#">
    <title><?php echo $gPageTitle ?></title>
    <?php if ($_GET['id']) {
    foreach($gMeta as $key=>$val) { ?>
    <meta property="<?php echo $key ?>" content="<?php echo $val?>"></meta>

    <?php }
      } else {  ?>
        <meta name="description" content="Arron sometimes works a software developer, but currently going to school at the University of Toronto for a masters degree in Computer science.  He has formerly lived and worked in the SF-bay area, California, and went to school at the University of British Columbia in Vancouver.  He grew up in British Columbia."></meta>

   <?php } //close if ?>

  
    <link rel="stylesheet" type="text/css" href="style.css" />

    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.min.js"></script>
    <script src="js/shared.js" type="text/javascript"></script>

    <!-- syntaxhighlighter stuff -->
    <link rel="stylesheet" href="syntaxhighlighter/css/shCore.css" type="text/css" />
    <link href="syntaxhighlighter/css/shThemeDefault.css" rel="stylesheet" type="text/css" />
    <script src="syntaxhighlighter/js/shCore.js" type="text/javascript"></script>
    <script src="syntaxhighlighter/js/shBrushRuby.js" type="text/javascript"></script>
    <script src="syntaxhighlighter/js/shBrushJScript.js" type="text/javascript"></script>
    <script src="syntaxhighlighter/js/shBrushCpp.js" type="text/javascript"></script>
    <script type="text/javascript">
      SyntaxHighlighter.all()
    </script>    
    <script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-29014426-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>

  </head>
    
  <body>

    <div id="wrapper">
      <div id="upperbarrier"></div>

      <div class="leftContainer">
        <script type="text/javascript">drawMenu()</script>
      </div>

      <script type="text/javascript">drawHeader()</script>
        
      <!-- content -->
      <div id="content">
        <?php
          do {

              $title = $row["title"];
              $id = $row["id"];

              $content = $row["content"];
              $type= $row["type"];

              //There is a js function toUserDate in shared.js that maps iso8601 -> user's timezone.
              //We're lazy, so we want to use this, so get an iso date.
              $date = date(DateTime::ISO8601, strtotime($row["date"] ));
        ?>
          <div class="main">
            <div class="titleblock">
              <h1 class="title"><a href="index.php?id=<?php echo $id ?>"><?php echo $title ?></a></h1>
              <h3 class="date" id="date<?php echo $id ?>">
              <script type="text/javascript">
                $("#date<?php echo $id ?>").html(toUserDate("<?php echo $date ?>") + "<br/><?php echo $type ?>");
              </script>
            </h3>
          </div>
          <?php echo $content ?>
        </div>
        <?php
                //end do-while loop
            } while($row = mysql_fetch_assoc($post))
        ?>
      </div>


      <?php if ($_GET['id']) {
        $url = 'http://anorwell.com/?id=' . $_GET['id'];
        ?>
      <div id="fb-root"></div>

      <!-- Currently using FB.init doesn't work with timeline.
      If they fix this, this script could change back to a FB.init-->
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js#appId=142482435788660&xfbml=1";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>

      <div class="comments">
        <div class="commentsinner">
          <fb:like href='<?php echo $url ?>'
          send="true" width="500" show_faces="true" font="arial"></fb:like>
          <fb:comments href='<?php echo $url?>'
          num_posts="5" width="500"></fb:comments>
        </div>
      </div>


      <?php } else { ?>
      
      <script>gFirstPost = 5;</script>
      <div id="allposts" class="allposts">
        <a href="javascript:getContent('')">More</a>
      </div>


    <?php } ?>

  </div> <!-- close wrapper -->
    <script type="text/javascript">drawFooter()</script>
  </body>
</html>
