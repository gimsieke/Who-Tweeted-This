// This is so effing ugly. Humiliating. I want to create nodes proper, but without resorting to DOM methods.
// The next Web should be done with XQuery.
var wtt_render_tweet = function(tweet, url) { 
	var created_at = tweet.created_at.replace(/\+0000/, 'UTC');
  return "<div class='tweet'><p class='tweet'>" 
            + wtt_render_tweet_text(tweet) 
            + "<span class='timestamp'>"
              + "<a title='" + created_at + "' href='http://twitter.com/#!/" + tweet.user.screen_name + "/status/" + tweet.id_str + "' target='_blank'>"
                + created_at + "</a> </span>" 
            + "<span class='timestamp'><a href='https://twitter.com/intent/favorite?tweet_id=" + tweet.id_str + "'>"
              + "<img src='http://si0.twimg.com/images/dev/cms/intents/icons/favorite.png' /> Favorite</a> "
              + "<a href='https://twitter.com/intent/retweet?tweet_id=" + tweet.id_str + "'>"
                + "<img src='http://si0.twimg.com/images/dev/cms/intents/icons/retweet.png' /> Retweet</a> "
              + "<a href='https://twitter.com/intent/tweet?in_reply_to=" + tweet.id_str + "'>"
                + "<img src='http://si0.twimg.com/images/dev/cms/intents/icons/reply.png' /> Reply</a>\n  "
              + "<a href='https://twitter.com/intent/tweet?text=" 
                          + encodeURIComponent('Thanks to “Who Tweeted This,” I found out that it was @' + wtt_genitive(tweet.user.screen_name) + ' tweet that pointed me to ' + url + ' ⇒http://chrome.google.com/webstore/detail/nlecohfddbofijkomahhaljdhbglildi')  + "'>"
                + "<img src='icons/wtt_16.png' /> Praise “Who Tweeted This”…</a></span>\n  "
            + "<span class='metadata'>"
              + "<span class='author'>"
                + "<a href='http://twitter.com/" + tweet.user.screen_name + "' target='_blank'>"
                  + "<img src='" + tweet.user.profile_image_url + "'/></a>"
                  + "<strong><a href='http://twitter.com/" + tweet.user.screen_name + "' target='_blank'>" + tweet.user.name + "</a></strong>"
                  + "<br/>" + tweet.user.screen_name + "</span></span></p></div>";
};

var wtt_render_tweet_text = function(tweet) {
  var ents = [];
  for (var etype in tweet.entities) {
    tweet.entities[etype].forEach(
      function(ent) {
        ents.push(ent);
      }
    );
  }
  var sorted_ents = ents.sort(
    function(a,b) {
      return a.indices[0] - b.indices[0];
    }
  );
  var start_pos = 0;
  var output = '';
  sorted_ents.forEach(
    function(ent) {
      end_pos = ent.indices[0];
      output += tweet.text.slice(start_pos, end_pos);
      output += wtt_tweetLink(ent);
      start_pos = ent.indices[1];
    }
  );
  var end_pos = tweet.text.length;
  output += tweet.text.slice(start_pos, end_pos);
  return sorted_ents.length == 0 ? tweet.text : output;
}

var wtt_tweetLink = function(ent) {
  if (ent.text !== undefined) {
    return "<a target='_blank' href='http://twitter.com/#!/search?q=%23" + encodeURIComponent(ent.text) + "' class='twitter-hastag' rel='nofollow' title='#" + ent.text + "'>#" + ent.text + '</a>'; 
  } else if (ent.screen_name !== undefined) {
    return "<a target='_blank' href='http://twitter.com/" + ent.screen_name + "' class='twitter-atreply' rel='nofollow' title='" + ent.name + "'>@" + ent.screen_name + '</a>'; 
  } else if (ent.url !== undefined) {
    var display_url = ent.display_url !== undefined && ent.display_url !== null ? ent.display_url : ent.url;
    var expanded_url = ent.expanded_url !== undefined && ent.expanded_url !== null ? ent.expanded_url : ent.url;
    return "<a target='_blank' href='" + ent.url + "' class='twitter-timeline-link' rel='nofollow' title='" + expanded_url + "'>" + display_url + '</a>'; 
  }
}

var wtt_genitive = function(name) {
  if (name.match(/s$/i)) {
    return name + "’";
  } else {
    return name + "’s";
  }
}

document.addEventListener(
  'DOMContentLoaded', 
  function() {
    chrome.tabs.getSelected(
      null, 
      function(tab) {
        chrome.extension.sendRequest(
          {action: "wtt_retrieve", link_href: tab.url}, 
          function(response) {
            var content = ''; // avoid DOM element creation at all cost ;-)
            for (tweet in response.tweets) {
              content += wtt_render_tweet(response.tweets[tweet], tab.url) + "\n  ";
            }
            document.getElementById('tweets').innerHTML = content;
          }
        );
      }
    );
  }, 
  false
);
