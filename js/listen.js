var gSongUrlPrefix = "http://anorwell.com/src/music/";

//The playlist of songs
var gPlaylist;

//hack to get playlistChange function outside of ready
var  playListChangeCallback;
var  playItem = 0;


//this player code is adapted from http://www.happyworm.com/jquery/jplayer/latest/demo-02-oggSupportFalse.htm
$(document).ready(function() {
    var params = getParams();
    if (params['song']) {
        gPlaylist = getPlaylist(params['song']);

        //hack--hide content if we're linking to a song
        $('#content').hide();
        $('#allposts').hide();
    } else {
        gPlaylist = getPlaylist();
    }

    // Local copy of jQuery selectors
	var jpPlayTime = $("#jplayer_play_time");
	var jpTotalTime = $("#jplayer_total_time");
	var jpStatus = $("#demo_status"); // For displaying information about jPlayer's status in the demo page

	$("#jquery_jplayer").jPlayer({
		ready: function() {
			displayPlayList();
			playListInit(false);
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

//Populates the playlist. If no arguments, with all songs. If aSong, then
//with any songs whose names include aSong (case insensitive)
function getPlaylist(aSong) {
    var req = new XMLHttpRequest();
    var playlist;
    req.open("GET", "content.py?type=music", false);
    req.send("");

    playlist = JSON.parse(req.responseText);
    if (aSong) {
        var re = new RegExp(aSong.replace(/%20/g,''), 'i');
        playlist = playlist.filter(function(val) {
                if (val.name.replace(/\s+/g,'').match(re) ) {
                    return true;
                } else { return false }
                    });
    }
    for(var song in playlist) {
        playlist[song].mp3 = gSongUrlPrefix + playlist[song].filename;
    }

    return playlist;
}
