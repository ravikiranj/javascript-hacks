<?php
/**
* Function to get Twitter User timeline
*
* @param String $user, Integer $page
* @return object response
*/
function getTwitterUserTimeline($user, $page) {
    $url = "http://api.twitter.com/1/statuses/user_timeline.json?screen_name=" . $user . "&page=" . $page;
    $session = curl_init($url);
    curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($session, CURLOPT_VERBOSE, true);
    $json = curl_exec($session);
    curl_close($session);
    return json_decode($json, true);
}

/**
* Function to build twitter timeline markup
*
* @param Array $data, Boolean $xhr
* @return String $html 
*/
function displayHTML($data, $xhr) {
    if(!$xhr){
        $html = <<<HTML
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">        
<html>
    <head><title>Infinite Scrolling using native Javascript and YUI3</title>
    <!--<link rel="stylesheet" href="http://ravikiranj.net/drupal/sites/all/hacks/infinite-scroll/infinite_scroll.css" type="text/css">-->
    <link rel="stylesheet" href="infinite_scroll.css" type="text/css">
    <body>
	<div class="tip">Scroll to the bottom of the page to see the infinite scrolling concept working</div>
        <div class="stream-container">
            <div class="stream-items">
HTML;
    }else {
        $html = "";
    }
    foreach($data as $item){
        $itemId = $itemp['id'];
        $username = $item['user']['name'];
        $userid = $item['user']['screen_name'];
        $userphoto = $item['user']['profile_image_url'];
        $tweetText = $item['text'];
        //Sun Jun 26 08:14:00 +0000 2011"
        list($D, $M, $d, $h, $m, $s, $z, $y) = sscanf($item['created_at'], "%3s %3s %2d %2d:%2d:%2d %5s %4d ");
        $tweetTime = $M . " " . $d; 
        $html .= <<<HTML
<div class="stream-item">
    <div class="stream-item-content tweet">
        <div class="tweet-image">
            <img class="user-profile-link" width="48" height="48" alt="{$username}" src="{$userphoto}" />
        </div>
        <div class="tweet-content">
            <div class="tweet-row">
                <span class="tweet-user-name">
                    <a class="tweet-screen-name user-profile-link" title="{$username}" href="http://twitter.com/{$userid}" target="_blank">{$userid}</a>
                    <span class="tweet-full-name">{$username}</span>
                </span>
            </div>
            <div class="tweet-row">
                <div class="tweet-text">
                    {$tweetText}
                </div>
            </div>
            <div class="tweet-row">
                <div class="tweet-timestamp">
                    {$tweetTime}
                </div>
            </div>
        </div>
    </div>
</div>
HTML;
    }
    if(!$xhr) {
    $html .= <<<HTML
        </div>
        </div>
        <div id="loading-gif">
            <!--<img src="http://ravikiranj.net/drupal/sites/all/hacks/infinite-scroll/loading.gif"></img>-->
            <img src="loading.gif"></img>
        </div>
        <div id="maxitems">Maximum (200) no. of items reached, please refresh the page</div>
    <!-- JS -->
    <script type="text/javascript" src="http://yui.yahooapis.com/combo?3.3.0/build/yui/yui-min.js"></script>
    <!--<script src="http://ravikiranj.net/drupal/sites/all/hacks/infinite-scroll/infinite_scroll.js"></script>-->
    <script src="infinite_scroll.js"></script>
    </body>
</html>
HTML;
    }
    return $html;
}

function init(){
    $user = "ravikiranj";
    $page = 1;
    $xhr = false;
    if(!empty($_GET['page'])){
        $page = $_GET['page'];
        $xhr = true;
    }
    $data = getTwitterUserTimeline($user, $page);
    $markup = displayHTML($data, $xhr);
    echo $markup;
}

//Call init
init();
?>

