var gSongUrlPrefix = "http://anorwell.com/src/music/";

//The playlist of songs
var gPlaylist;

//hack to get playlistChange function outside of ready
var  playListChangeCallback;
var  playItem = 0;


//this player code is adapted from http://www.happyworm.com/jquery/jplayer/latest/demo-02-oggSupportFalse.htm
$(document).ready(function() {
    gPlaylist = getPlaylist();    
    var autoplay = parseURL();

    // Local copy of jQuery selectors
	var jpPlayTime = $("#jplayer_play_time");
	var jpTotalTime = $("#jplayer_total_time");
	var jpStatus = $("#demo_status"); // For displaying information about jPlayer's status in the demo page

	$("#jquery_jplayer").jPlayer({
		ready: function() {
			displayPlayList();
			playListInit(autoplay); // Parameter is a boolean for autoplay.
            },
        errorAlerts: true,
                })
	.jPlayer("onProgressChange", function(loadPercent, playedPercentRelative, playedPercentAbsolute, playedTime, totalTime) {
		jpPlayTime.text($.jPlayer.convertTime(playedTime));
		jpTotalTime.text($.jPlayer.convertTime(totalTime));
 
	})
    
	.jPlayer("onSoundComplete", function() {
		playListNext();
	});
 
	$("#jplayer_previous").click( function() {
		playListPrev();
		$(this).blur();
		return false;
	});
 
	$("#jplayer_next").click( function() {
		playListNext();
		$(this).blur();
		return false;
	});
 
	function displayPlayList() {
		$("#jplayer_playlist ul").empty();
		for (i=0; i < gPlaylist.length; i++) {
			var listItem = (i == gPlaylist.length-1) ? "<li class='jplayer_playlist_item_last'>" : "<li>";
			listItem += "<a href='#' id='jplayer_playlist_item_"+i+"' tabindex='1'>"+ gPlaylist[i].name +"</a></li>";
			$("#jplayer_playlist ul").append(listItem);
			$("#jplayer_playlist_item_"+i).data( "index", i ).click( function() {
				var index = $(this).data("index");
				if (playItem != index) {
					playListChange( index );
				} else {
					$("#jquery_jplayer").jPlayer("play");
				}
				$(this).blur();
				return false;
			});
		}
	}
 
	function playListInit(autoplay) {
		if(autoplay) {
			playListChange( playItem );
		} else {
			playListConfig( playItem );
		}
	}
 
	function playListConfig( index ) {
		$("#jplayer_playlist_item_"+playItem).removeClass("jplayer_playlist_current").parent().removeClass("jplayer_playlist_current");
		$("#jplayer_playlist_item_"+index).addClass("jplayer_playlist_current").parent().addClass("jplayer_playlist_current");
		playItem = index;
		$("#jquery_jplayer").jPlayer("setFile", gPlaylist[playItem].mp3);
	}
 
	function playListChange( index ) {
		playListConfig( index );
		$("#jquery_jplayer").jPlayer("play");
	}

    playListChangeCallback = playListChange;
 
	function playListNext() {
		var index = (playItem+1 < gPlaylist.length) ? playItem+1 : 0;
		playListChange( index );
	}
 
	function playListPrev() {
		var index = (playItem-1 >= 0) ? playItem-1 : gPlaylist.length-1;
		playListChange( index );
	}

    });

function getPlaylist() {
    var req = new XMLHttpRequest();
    var playlist;
    req.open("GET", "content.py?type=music", false);
    req.send("");

    playlist = JSON.parse(req.responseText);
    for(var song in playlist) {
        playlist[song].mp3 = gSongUrlPrefix + playlist[song].filename;
    }

    return playlist;
}
    
function parseURL() {
    params = getParams(); //shared.js
    //process song param
    if (params['song'] ) {
        var re = new RegExp(params['song'].replace(/%20/g, ''));
        for (var song in gPlaylist) {
            if ( gPlaylist[song].name.replace(/\s+/g, '').match(re) ) {
                playItem = parseInt(song);
                return true;
            }
        }
    }
    return false;
}
