
function tweet_path(context_node) { 
	var href = document.evaluate("ancestor::div[@class = 'stream-item' or @class = 'stream-item ']//a[@class = 'tweet-timestamp']/@href", context_node, null, XPathResult.STRING_TYPE, null).stringValue;
	return href;
}


function register_tweet_for_link(tweet_path, link_href) { 
	chrome.extension.sendRequest({action: "wtt_register",
																	 tweet_path: tweet_path,
																	 link_href: link_href
																	 }, 
															 function(response) {
															 });
}


var patch_links = function() {
	var links = document.getElementsByClassName("twitter-timeline-link");
	for (var i = 0; i < links.length; i++) {
		if (! links[i].dataset.wtt) {
			//			links[i].addEventListener("click", function() { resolve_url(this.getAttribute("href")); }, false);
			links[i].addEventListener("click", function() { register_tweet_for_link(tweet_path(this), this.getAttribute("data-expanded-url")); }, false);
			links[i].dataset.wtt = 'set';
		}
	}
};

var resolve_url = function(url) {
	var loc = url;
	var req = new XMLHttpRequest();
	req.open("HEAD", url);
	req.send();
 	req.onreadystatechange = function() {
		var headers = req.getAllResponseHeaders();
		alert(headers);
 	};
}

// 		while (req.status.match(/^3/)) {
// 			loc = req.getResponseHeader("Location");
// 			resolve_url(loc);
//		}


var repeat = setInterval(
												 function() {
													 patch_links();
												 },
												 1000
												 );
