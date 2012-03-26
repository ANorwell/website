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

//the position of the first post to show, initially 0
$gFirst = 0;

//the meta info for the page and post
$gPageTitle = "Arron Norwell";
$gKeywords = "arron,norwell,arron norwell";
$gMeta = array(
               "keywords" => "arron,norwell,arron norwell",
               "fb:admins" => "632644359",
               "fb:app_id" => "142482435788660",
               "og:type" => "anorwell:post",
               "og:image" => "http://anorwell.com/icon.gif"
               );


function getPost($filter, $first, $to_show) {
  //avoid sql injection
  if ( ($filter == 1) or
       preg_match("/id=\d+/", $filter) or
       preg_match("/type LIKE '%\w+%'/", $filter) ) {
    if (preg_match("/\d/", $first)) {
      return mysql_query("SELECT id,title,content,date,type FROM post WHERE $filter ORDER BY id DESC LIMIT $first, $to_show");
    }
  }
}

function selectPosts() {
  global $gConfig, $gFirst, $gPost;
  $query = 1;
  if (array_key_exists("id", $_GET)) {
    $query = "id=$_GET[id]";
  } elseif (array_key_exists("type", $_GET) ) {
    $query = "type LIKE '%$_GET[type]%'";
  }

  if (array_key_exists("first", $_GET) ) {
    $gFirst = $_GET["first"];
  }

  $to_show = $gConfig['postsPerPage'];
  error_log("first is $gFirst and to_show is $to_show");
  $gPost = getPost($query, $gFirst, $to_show);

  if (!$gPost) {
    die('Invalid query: ' . mysql_error());
  }
}

$link = mysql_connect($gConfig['host'], $gConfig['user'], $gConfig['dbPw']);
if (!$link) {
  die('Could not connect: ' . mysql_error());
}
mysql_select_db($gConfig['db']);
selectPosts();

//Process the first row, so we can use it in the head.
$gRow = mysql_fetch_assoc($gPost);
if (array_key_exists("id", $_GET)) {
  $gPageTitle = "$row[title] - Arron Norwell";
  $gMeta["keywords"] .= "," . $row["type"];
  $gMeta["og:url"] = "http://anorwell.com/?id=" . $_GET['id'];
  $gMeta["og:title"] = $gPageTitle;
}

//get  query string for the "Prev" and "Next" links, omitting "first"
$gQuery = "";
foreach ($_GET as $key=>$val) {
  if ($key != 'first') {
    $gQuery .= "$key=$val";
  }
}
  
?>

<!DOCTYPE html> 
<html lang="en"> 
  <head> 
    <meta charset="utf-8"> </meta>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> </meta>

    <title><?php echo $gPageTitle ?></title>
    <?php if (array_key_exists("id", $_GET)) {
    foreach($gMeta as $key=>$val) { ?>
    <meta property="<?php echo $key ?>" content="<?php echo $val?>"></meta>

    <?php }
    } else {  ?>
    <meta name="description" content="Arron sometimes works a software developer, but currently going to school at the University of Toronto for a masters degree in Computer science.  He has formerly lived and worked in the SF-bay area, California, and went to school at the University of British Columbia in Vancouver.  He grew up in British Columbia."></meta>

    <?php } //close if ?>

    
    <!--[if lt IE 9]>
        <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]--> 
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7/jquery.min.js"></script>
    <script src="js/shared.js"></script>
    <link href="bootstrap/css/bootstrap.css" rel="stylesheet"> </link>
    <style> 
      body {
      padding-top: 60px; /* 60px to make the container go all the way to the bottom of the topbar */
      }
      .post > p {
      font: normal normal normal 16px/21px "TeX Gyre Schola","Georgia","Bitstream Charter","Century Schoolbook L","Liberation Serif","Times",serif;
      color: #444;
      }

    </style> 
    <link href="bootstrap/css/bootstrap-responsive.css" rel="stylesheet"> </link>
    
    <link rel="shortcut icon" href="favicon.ico"> </link>

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
    
    <div class="navbar navbar-fixed-top"> 
      <div class="navbar-inner"> 
        <div class="container"> 
          <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse"> 
            <span class="icon-bar"></span> 
            <span class="icon-bar"></span> 
            <span class="icon-bar"></span> 
          </a> 
          <a class="brand" href="indexbs.php">Arron Norwell</a> 
          <div class="nav-collapse"> 
            <ul class="nav"> 
              <li><a href="indexbs.php">Home</a></li>
              <li><a href="indexbs.php?type=project">Projects</a></li> 
              <li><a href="listen.html">Music</a></li>
              <li><a href="about.html">About</a></li> 
            </ul> 
          </div><!--/.nav-collapse --> 
        </div> 
      </div> 
    </div>

    <div class="container"> 
      <div id="content">
        <?php
          do {

            $title = $gRow["title"];
            $id = $gRow["id"];
            $content = $gRow["content"];
            $type= $gRow["type"];

            //There is a js function toUserDate in shared.js that maps iso8601 -> user's timezone.
            //We're lazy, so we want to use this, so get an iso date.
            $date = date(DateTime::ISO8601, strtotime($gRow["date"] ));
        ?>
        <div class="row">
          <div class="span8 offset2 post">
            <h1 class="title"><a href="indexbs.php?id=<?php echo $id ?>"><?php echo $title ?></a></h1>
            <h6 class="date" id="date<?php echo $id ?>">
            <script type="text/javascript">
              $("#date<?php echo $id ?>").html(toUserDate("<?php echo $date ?>") + "<br/><?php echo $type ?>");
            </script>
          </h6>
          <?php echo $content ?>
        </div>
      </div> <!-- end row -->
      
      <?php
            //end do-while loop
          } while($gRow = mysql_fetch_assoc($gPost))
      ?>
    </div> <!-- end #content -->

    <?php if (!array_key_exists("id", $_GET)) { ?>
    <ul class="pager">
      <?php if ($gFirst > 0) { ?>
      <li class="previous">
        <a href="indexbs.php?<?php echo $gQuery . '&first='. ($gFirst-$gConfig['postsPerPage']) ?>">Newer</a>
      </li>
      <?php } ?>
      
      <li class="next">
        <a href="indexbs.php?<?php echo $gQuery . '&first='. ($gFirst+$gConfig['postsPerPage']) ?>">Older</a>
      </li>
    </ul>
    <?php } ?>
    
    <hr />
    <footer>
      <p> Content (C) <a href="mailto:anorwell@gmail.com">Arron Norwell.</a>.  This website is on <a href="http://github.com/ANorwell/website">github.</a></p>
    </footer>
  </div> <!-- /container -->
  <script src="bootstrap/js/bootstrap-collapse.js"></script> 
</body> 
</html>      
