//The playlist of songs
var myPlayList = [
{name:"The Sound of Silence", mp3:"http://anorwell.com/src/music/2010/soundofsilence.mp3"},
{name:"One Great City", mp3:"http://anorwell.com/src/music/2010/onegreatcity-2.mp3"},
{name:"Desire's Only Fling", mp3:"http://anorwell.com/src/music/2010/desiresonlyfling-2.mp3"},
{name:"The Cave", mp3:"http://anorwell.com/src/music/2010/thecave.mp3"},
{name:"The Mind - Arron Norwell", mp3:"http://anorwell.com/src/music/2010/themind.mp3"},
{name:"Hallelujah", mp3:"http://anorwell.com/src/music/2010/hallelujah-better.mp3"},

];

//hack to get playlistChange function outside of ready
var  playListChangeCallback;
var  playItem = 0;

$(document).ready(function(){
    var autoplay = parseURL();
	// Local copy of jQuery selectors, for performance.
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
		for (i=0; i < myPlayList.length; i++) {
			var listItem = (i == myPlayList.length-1) ? "<li class='jplayer_playlist_item_last'>" : "<li>";
			listItem += "<a href='#' id='jplayer_playlist_item_"+i+"' tabindex='1'>"+ myPlayList[i].name +"</a></li>";
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
		$("#jquery_jplayer").jPlayer("setFile", myPlayList[playItem].mp3);
	}
 
	function playListChange( index ) {
		playListConfig( index );
		$("#jquery_jplayer").jPlayer("play");
	}

    playListChangeCallback = playListChange;
 
	function playListNext() {
		var index = (playItem+1 < myPlayList.length) ? playItem+1 : 0;
		playListChange( index );
	}
 
	function playListPrev() {
		var index = (playItem-1 >= 0) ? playItem-1 : myPlayList.length-1;
		playListChange( index );
	}


    });

function parseURL() {
    //parse the url for song= param, and start that song
    var params = {};
    var url = parent.document.URL;

    if (url.match(/\?/)) {
        var pairs = url.replace(/#.*$/, '').replace(/^.*\?/, '').split(/[&;]/);
        for (var p in pairs) {
            var keyPair = pairs[p].split(/=/);
            params[keyPair[0]] = keyPair[1];
        }

        //process song param
        if (params['song'] ) {
            var re = new RegExp(params['song'].replace(/%20/g, ''));
            for (var song in myPlayList) {
                if ( myPlayList[song].name.replace(/\s+/g, '').match(re) ) {
                    playItem = song;
                    return true;
                }
            }
        }
    }
}
