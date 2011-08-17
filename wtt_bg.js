
wtt_tweetPath_by_pageUrl = {};

chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {
    if (wtt_tweetPath_by_pageUrl[wtt_normalize_url(decodeURIComponent(tab.url))] !== undefined) return chrome.pageAction.show(tab.id);
  }
);

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "wtt_register") {
			if (wtt_tweetPath_by_pageUrl[wtt_normalize_url(decodeURIComponent(request.link_href))] == undefined) {
				wtt_tweetPath_by_pageUrl[wtt_normalize_url(decodeURIComponent(request.link_href))] = {};  
			}
			wtt_get_tweet(wtt_normalize_url(decodeURIComponent(request.link_href)), request.tweet_path);
      sendResponse({});
    }
  }
);                                       

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "wtt_retrieve") {
      sendResponse(
        { tweets: wtt_tweetPath_by_pageUrl[wtt_normalize_url(decodeURIComponent(request.link_href))] }
      );
    }
  }
);                                    

// Should resolve shortened links properly, by following the 30x until finally resolved, saving the last Location HTTP field. 
// Unfortunately and surprisingly, there doesn't seem to be a straightforward way to achieve this.
var wtt_normalize_url = function(url) {
  return url.replace(/([#?].*|\/)$/, '');
};

var wtt_get_tweet = function(url, tweet_path) {
	var tweet_id = tweet_path.replace(/^.+\//, '');
	var req = new XMLHttpRequest();
	req.open('GET', 'http://api.twitter.com/1/statuses/show.json?id=' + tweet_id);
	req.onreadystatechange = function() {
		if (req.readyState === 4 && req.status === 200) {
			var res = JSON.parse(req.responseText);
			wtt_tweetPath_by_pageUrl[url][tweet_path] = res;
		}
	};
	req.send();
};
