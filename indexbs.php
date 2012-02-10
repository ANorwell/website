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
} elseif ($_GET["tag"] ) {
  $post = getPost("tag = $_GET[tag]");
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
<html lang="en"> 
  <head> 
    <meta charset="utf-8"> 
    <title><?php echo $gPageTitle ?></title>
    <?php if ($_GET['id']) {
    foreach($gMeta as $key=>$val) { ?>
    <meta property="<?php echo $key ?>" content="<?php echo $val?>"></meta>

    <?php }
      } else {  ?>
        <meta name="description" content="Arron sometimes works a software developer, but currently going to school at the University of Toronto for a masters degree in Computer science.  He has formerly lived and worked in the SF-bay area, California, and went to school at the University of British Columbia in Vancouver.  He grew up in British Columbia."></meta>

   <?php } //close if ?>

 
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]--> 
 
    <link href="bootstrap/css/bootstrap.css" rel="stylesheet"> 
    <style> 
      body {
        padding-top: 60px; /* 60px to make the container go all the way to the bottom of the topbar */
      }
    </style> 
    <link href="bootstrap/css/bootstrap-responsive.css" rel="stylesheet"> 
 
    <link rel="shortcut icon" href="favicon.ico"> 
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
          <a class="brand" href="#">Arron Norwell</a> 
          <div class="nav-collapse"> 
            <ul class="nav"> 
              <li class="active"><a href="/">Home</a></li> 
              <li><a href="#about">About</a></li> 
              <li><a href="#contact">Contact</a></li> 
            </ul> 
          </div><!--/.nav-collapse --> 
        </div> 
      </div> 
    </div>

    <div class="container"> 
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
        <div class="row">
          <div class="span8 offset2">
              <h1 class="title"><a href="index.php?id=<?php echo $id ?>"><?php echo $title ?></a></h1>
              <h6 class="date" id="date<?php echo $id ?>">
              <script type="text/javascript">
                $("#date<?php echo $id ?>").html(toUserDate("<?php echo $date ?>") + "<br/><?php echo $type ?>");
              </script>
            </h6>
            <?php echo $content ?>
          </div>
        </div>
        <?php
              //end do-while loop
            } while($row = mysql_fetch_assoc($post))
        ?>
        </div> <!-- end #content -->
        <ul class="pager">
          <li class="next"><a href="#">More</a></li>
        </ul>
      
      <hr />
      <footer>
        <p> Content (C) <a href="mailto:anorwell@gmail.com">Arron Norwell.</a>.  This website is on <a href="http://github.com/ANorwell/website">github.</a></p>
      </footer>


    </div> <!-- /container -->

 
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7/jquery.min.js"></script>
    <script src="bootstrap/js/bootstrap-collapse.js"></script> 

 
  </body> 
</html>      
  </body>
</html>
