
var imageList = new Array();
var pos = 0;

imageList[0] = "../images/colca_panorama_s.png";
imageList[1] = "../images/bike_s.png";
imageList[2] = "../images/wanyapicchu_s.png";

var images = new Array();

var current = new Image();
current.src = imageList[0];
var next = new Image();
next.src = imageList[1];

function loadFirst() {
	images[0] = new Image();
	images[0].src = imageList[0];
	images[1] = new Image();
	images[1].src = imageList[1];
}

function loadNext() {
	pos = (pos + 1) % imageList.length;
	var npos = (pos + 1) % imageList.length;
	if (images[ ( npos % imageList.length )] == null) {
		images[npos] = new Image();
		images[npos].src = imageList[npos];
	}
	document.image.src = images[pos].src;
}
