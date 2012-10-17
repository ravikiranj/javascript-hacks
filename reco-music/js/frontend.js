// Create a YUI sandbox on your page.
YUI().use('node', 'event', 'io', 'jsonp','jsonp-url','json-parse', 'autocomplete', 'datasource', function (Y) {
    var keyUpCount = 0;
    var prevSearchTerm = '';
    var renderPlaylistFlag = 0;
    /*
     * handleKeyUp - handle key up event for search text field
     *
     */
    var handleKeyUp =  function(e){
        //Stop event
        e.preventDefault();
        var searchTerm = this.get('value');

        //Increment counter
        keyUpCount++;
        if(keyUpCount > 100){
            keyUpCount = 1;
        }
        //Save some requests by sending requests for every 2 keypress events 
        if(keyUpCount % 2 == 0 && prevSearchTerm !== searchTerm){
            getAutoCompleteResults(searchTerm);
            prevSearchTerm = searchTerm;
        }
    };

    /*
     * getAutoCompleteResults - fetch auto completion results
     *
     */
    var getAutoCompleteResults = function(keyword){
        //Use Y.jsonp for cross-domain requests and Y.io for same domain requests !!!
        var query = encodeURIComponent(keyword);
        var uri = 'http://suggestqueries.google.com/complete/search?hl=en&ds=yt&client=youtube&hjson=t&jsonp=window.getAutoCompleteResultsSuccess&q='+query;
        Y.jsonp(uri, getAutoCompleteResultsSuccess);
    };

    /*
     * getAutoCompleteResultsSuccess - success handler for getAutoCompleteResults (Global -> window.getAutoCompleteResultsSuccess)
     *
     */
    getAutoCompleteResultsSuccess = function(response){
        if(!response){
            Y.one('#error').setStyle('display', 'block')
            return;
        }
        if(response[1] && response[1][0] && response[1][0][0]){
            var topSuggest = response[1][0][0];
            Y.one('#suggest').setContent(topSuggest);
            //Call YTSearchResults
            getYTSearchResults(topSuggest);
        }
    };

    /*
     * getAutoCompleteResultsFailure - failure handler for getAutoCompleteResults
     *
     */
    var getAutoCompleteResultsFailure = function(id, response, args){
        Y.one('#error').setStyle('display', 'block')
    };

    /*
     * getYTSearchResults - get YouTube search results for a keyword
     *
     */
    var getYTSearchResults = function(keyword){
        var query = encodeURIComponent(keyword);
        var uri = 'https://gdata.youtube.com/feeds/api/videos?q='+query+'&alt=json&max-results=10&v=2';
        var cfg = {
            method: 'GET',

            on:{
                success: getYTSearchResultsSuccess,
                failure: getYTSearchResultsFailure
            }
        }
        var request = Y.io(uri, cfg);

    };

    /*
     * getYTSearchResultsSuccess - success handler for getYTSearchResults
     *
     */
    var getYTSearchResultsSuccess = function(id, o, args){
        if(!o && !o.responseText){
            Y.one('#status').setContent('Failed to get valid response');
            return;
        }
        var response = Y.JSON.parse(o.responseText);
        console.log(response);
        if(response.feed && response.feed.entry && response.feed.entry[0] && response.feed.entry[0].media$group){
            var video = response.feed.entry[0].media$group;
            var title = '';
            var videoID = '';
            if(video.media$title && video.media$title.$t && video.yt$videoid && video.yt$videoid.$t){
                title = video.media$title.$t;
                videoID = video.yt$videoid.$t;
                iframeHTML = '<iframe id="ytplayer" type="text/html" width="450" height="350" src="http://www.youtube.com/embed/'+videoID+'?autoplay=1" frameborder="0"/>';
                Y.one('#video-player').setContent(iframeHTML);
                Y.one('#video-title').setContent(title);
                Y.one('#right').setStyle('display', 'block');
                Y.one('#recommend-button').setStyle('display', 'block');

                if(!renderPlaylistFlag){
                    renderPlaylistFlag = 1;
                    renderPlaylist();
                }
            }
        }
    };

    /*
     * getYTSearchResultsFailure - failure handler for getYTSearchResults
     *
     */
    var getYTSearchResultsFailure = function(id, response, args){
        Y.one('#status').setContent('Failed to get valid response');
    };

    var renderPlaylist = function(){
       //Use Y.jsonp for cross-domain requests and Y.io for same domain requests !!!
        var uri = 'http://gdata.youtube.com/feeds/api/playlists/PLcN58y5aSltRPvPi3m8Yw2F_NXev2Xqq7?v=2&alt=json&jsonp=window.getPlaylistVideoSuccess'
        Y.jsonp(uri, getPlaylistVideoSuccess);
    };

    //Global
    getPlaylistVideoSuccess = function(response){
       if(!response){
            Y.one('#error').setStyle('display', 'block')
            return;
       }
       console.log(response);
       if(response.feed && response.feed.entry){
           var videoArr = response.feed.entry;
           var iframeHTML = '';
           for(var i = 0; i < videoArr.length; i++){
               if(videoArr[i].media$group){
                   var video = videoArr[i].media$group;
                   if(video.media$title && video.media$title.$t && video.yt$videoid && video.yt$videoid.$t){
                       title = video.media$title.$t;
                       videoID = video.yt$videoid.$t;
                       iframeHTML = '<div id="playlist-vid"><iframe id="ytplayer" type="text/html" width="200" height="120" src="http://www.youtube.com/embed/'+videoID+'?" frameborder="0"/></div>';
                       Y.one('#video-playlist').append(iframeHTML);
                    }
               }
           }
       }
    };

    var sKeyword = Y.one('#keyword');
    sKeyword.on('keyup', handleKeyUp);
});
