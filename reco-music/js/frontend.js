// Create a YUI sandbox on your page.
YUI().use('node', 'event', 'io', 'jsonp','jsonp-url','json-parse', 'autocomplete', 'datasource', function (Y) {
    /*
     * handleKeyUp - handle key up event for search text field
     *
     */
    handleKeyUp =  function(e){
        //Stop event
        e.preventDefault();
        var searchTerm = this.get('value');
        getAutoCompleteResults(searchTerm);
    };

    /*
     * getAutoCompleteResults - fetch auto completion results
     *
     */
    getAutoCompleteResults = function(keyword){
        //Use Y.jsonp for cross-domain requests and Y.io for same domain requests !!!
        var query = encodeURIComponent(keyword);
        var uri = 'http://suggestqueries.google.com/complete/search?hl=en&ds=yt&client=youtube&hjson=t&jsonp=window.getAutoCompleteResultsSuccess&q='+query;
        Y.jsonp(uri, getAutoCompleteResultsSuccess);
    };

    /*
     * getAutoCompleteResultsSuccess - success handler for getAutoCompleteResults
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
    getAutoCompleteResultsFailure = function(id, response, args){
        Y.one('#error').setStyle('display', 'block')
    };

    /*
     * getYTSearchResults - get YouTube search results for a keyword
     *
     */
    getYTSearchResults = function(keyword){
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
    getYTSearchResultsSuccess = function(id, o, args){
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
            }
        }
    };

    /*
     * getYTSearchResultsFailure - failure handler for getYTSearchResults
     *
     */
    getYTSearchResultsFailure = function(id, response, args){
        Y.one('#status').setContent('Failed to get valid response');
    };

    var sKeyword = Y.one('#keyword');
    sKeyword.on('keyup', handleKeyUp);
});
