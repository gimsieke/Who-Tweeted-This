
function tweet_path(context_node) { 
  var href = document.evaluate("ancestor::div[@class = 'stream-item' or @class = 'stream-item ']//a[@class = 'tweet-timestamp']/@href", context_node, null, XPathResult.STRING_TYPE, null).stringValue;
  return href;
}


function wtt_open_tab(tweet_path, link_href, select) { 
  chrome.extension.sendRequest(
    {action: "wtt_open_tab",
     tweet_path: tweet_path,
     link_href: link_href,
     selected: select,
    }, 
    function(response) {}
  );
}


var patch_links = function() {
  var links = document.getElementsByClassName("twitter-timeline-link");
  for (var i = 0; i < links.length; i++) {
    if (! links[i].dataset.wtt) {
      links[i].addEventListener("click", function(e) {
        e.preventDefault();
        var select = 'true';
        if (e.button == 1) { // middle button
          select = 'false';
        }
        wtt_open_tab(tweet_path(this), this.href, select)
      });
      links[i].dataset.wtt = 'set';
    }
  }
};

var repeat = setInterval(
  function() {
    patch_links();
  },
  1000
);
