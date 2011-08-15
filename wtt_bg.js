
wtt_tweetPath_by_pageUrl = {};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
																		if (wtt_tweetPath_by_pageUrl[wtt_normalize_url(tab.url)]) return chrome.pageAction.show(tab.id);
																	});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
																				 if (request.action == "wtt_register") {
																					 wtt_tweetPath_by_pageUrl[wtt_normalize_url(request.link_href)] = request.tweet_path;
																					 sendResponse({});
																				 }
																			 });																			 

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
																				 if (request.action == "wtt_retrieve") {
 																					 sendResponse(wtt_tweetPath_by_pageUrl[wtt_normalize_url(request.link_href)]);
																				 }
																			 });																			 

// Will have to use proper resolution of shortened links! 
// This is a quick fix only:
wtt_normalize_url = function(url) {
	return url.replace(/(#.*|\/(\?.+)?)$/, '');
};
