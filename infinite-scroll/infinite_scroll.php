<?php
/**
* Function to get RSS Feed Items
*
* @param String $user, Integer $page
* @return object response
*/
function getRSSFeedItems($limit, $offset) {
    $baseURL = "http://query.yahooapis.com/v1/public/yql?";
    $query = "select title,link,pubDate from rss where url='http://rss.news.yahoo.com/rss/topstories' limit ${limit} offset {$offset}";
    $url = $baseURL . "format=json&q=" . urlencode($query);
    $session = curl_init($url);
    curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
    $json = curl_exec($session);
    curl_close($session);
    return json_decode($json, true);
}

/**
* Function to build RSS item markup
*
* @param Array $data, Boolean $xhr
* @return String $html 
*/
function displayHTML($data, $xhr) {
    if(!$xhr){
        $html = <<<HTML
<!DOCTYPE html>
<html>
    <head><title>Infinite Scrolling using native Javascript and YUI3</title>
    <link rel="stylesheet" href="infinite_scroll.css" type="text/css">
    <body>
	<div class="tip">Scroll to the bottom of the page to see the infinite scrolling concept working</div>
        <div class="stream-container">
            <div class="stream-items">
HTML;
    }else {
        $html = "";
    }
    if(!empty($data) && !empty($data['error'])){
        $errorDesc = "";
        if(!empty($data['error']['description'])) {
            $errorDesc = "<p>Error: " . $data['error']['description'] . "</p>";
        }
        $html .= <<<HTML
    <div class="error">
        <p>Sorry, error encountered, please try again after sometime.</p>
        {$errorDesc}
    </div>
HTML;
    }else{
        //Extract the results
        if(!empty($data) && !empty($data['query']) && !empty($data['query']['results']) && !empty($data['query']['results']['item'])){
            $data = $data['query']['results']['item'];
            foreach($data as $item){
                if(empty($item['title']) || empty($item['link']) || empty($item['pubDate'])) {
                    return;
                }
                $title = $item['title'];
                $link = $item['link'];
                $pubDate = $item['pubDate'];
                $html .= <<<HTML
<div class="stream-item">
    <div class="stream-item-content rss-headline">
        <div class="rss-content">
            <img class="rss-image" alt="rss icon" src="rss.png" />
            <div class="rss-row">
                <a href="${link}" target="_blank">$title</a>
            </div>
            <div class="rss-row">
                <div class="rss-timestamp">
                    {$pubDate}
                </div>
            </div>
        </div>
    </div>
</div>
HTML;
            }
        }else{
            $html .= "No more top stories";
        }
    }

    if(!$xhr) {
    $html .= <<<HTML
        </div>
        </div>
        <div id="loading-gif">
            <img src="loading.gif"></img>
        </div>
        <div id="maxitems">Maximum (200) no. of items reached, please refresh the page</div>
        <div id="no_more_rss">No more rss headlines left to fetch</div>
    <!-- JS -->
    <script type="text/javascript" src="http://yui.yahooapis.com/combo?3.3.0/build/yui/yui-min.js"></script>
    <script src="infinite_scroll.js"></script>
    </body>
</html>
HTML;
    }
    return $html;
}

function init(){
    $offset = 0;
    $xhr = false;
    if(!empty($_GET['offset'])){
        $offset = $_GET['offset'];
        $xhr = true;
    }
    $limit = 20;
    $data = getRSSFeedItems($limit, $offset);
    $markup = displayHTML($data, $xhr);
    echo $markup;
}

//Call init
init();
?>
