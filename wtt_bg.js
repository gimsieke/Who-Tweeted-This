
wtt_tweetPath_by_pageUrl = {};
wtt_tweetPath_by_tabId = {};
wtt_openedTabs = 0;

chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {
    if (wtt_tweetPath_by_tabId[tab.id] !== undefined && changeInfo.status == 'complete') {
      if (wtt_tweetPath_by_pageUrl[decodeURIComponent(tab.url)] == undefined) {
        wtt_tweetPath_by_pageUrl[decodeURIComponent(tab.url)] = {};  
      }
      wtt_get_tweet(decodeURIComponent(tab.url), tab.id);
    }
  }
);

chrome.tabs.onRemoved.addListener(
  function(tabId, removeInfo) {
    if (wtt_tweetPath_by_tabId[tabId] !== undefined) {
      wtt_openedTabs--;
    }
  }
);

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "wtt_open_tab") {
      var selected = true;
      if (request.selected == 'false') {
        selected = false;
      }
      wtt_openedTabs++;
      chrome.tabs.create(
        { url:request.link_href, selected:selected, index:sender.tab.index + wtt_openedTabs },
        function(tab) {
          wtt_tweetPath_by_tabId[tab.id] = request.tweet_path;
        }
      );
      sendResponse({});
    }
  }
);                                       

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "wtt_retrieve") {
      sendResponse(
        { tweets: wtt_tweetPath_by_pageUrl[decodeURIComponent(request.link_href)] }
      );
    }
  }
);                                    

var wtt_get_tweet = function(url, tabId) {
  var tweet_path = wtt_tweetPath_by_tabId[tabId];
  var tweet_id = tweet_path.replace(/^.+\/([0-9]+)\/?/, '$1');
  var req = new XMLHttpRequest();
  req.open('GET', 'http://api.twitter.com/1/statuses/show.json?include_entities=1&id=' + tweet_id);
  req.onreadystatechange = function() {
    if (req.readyState === 4 && req.status === 200) {
      var res = JSON.parse(req.responseText);
      wtt_tweetPath_by_pageUrl[url][tweet_path] = res;
      if (res.id_str !== undefined) {
        chrome.pageAction.show(tabId);
      }

    }
  };
  req.send();
};
