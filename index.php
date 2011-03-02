<?php

$gServer = "anorwell.powwebmysql.com";
$gUser = "darkchrono";
$gDB = "arron";
$gPw = base64_decode('c2VsZWN0');

$gPageTitle = "Arron Norwell";
$gKeywords = "arron,norwell,arron norwell";

$link = mysql_connect($gServer, $gUser, $gPw);

if (!$link) {
    die('Could not connect: ' . mysql_error());
}

mysql_select_db($gDB);

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
    $gKeywords = $gKeywords . "," . $row["type"];
 }    
                      
?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:fb="http://www.facebook.com/2008/fbml">
  <head>
    <title><?php echo $gPageTitle ?></title>
    <?php if (! $_GET['id']) { ?>
<meta name="description" content="Arron sometimes works a software developer, but currently going to school at the University of Toronto for a masters degree in Computer science.  He has formerly lived and worked in the SF-bay area, California, and went to school at the University of British Columbia in Vancouver.  He grew up in British Columbia."></meta>
   <?php } ?>
<meta name="keywords" content="<?php echo $gKeywords ?>"></meta>
    
    <link rel="stylesheet" type="text/css" href="style.css" />
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.min.js"></script>
    <script src=
"http://static.ak.connect.facebook.com/js/api_lib/v0.4/FeatureLoader.js.php" 
type="text/javascript"></script>
    <script src="js/shared.js" type="text/javascript"></script>
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

        if ($_GET["id"]) {
            $gPageTitle = "$row[title] - Arron Norwell";
        }

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
                document.write(toUserDate("<?php echo $date ?>"))
             </script>
           <br/> <?php echo $type ?></h3>
       </div>
        <?php echo $content ?>
     </div>
        <?php
        //end do-while loop
        } while($row = mysql_fetch_assoc($post))
        ?>
        </div>
         <script type="text/javascript">emitEndOfPage()</script>
    </div>
              
    <script type="text/javascript">drawFooter()</script>
  </body>
</html>
