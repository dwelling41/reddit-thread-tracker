var _ = require('underscore');


var _isRedditUrl = function(url) {
	// Make sure it's a valid string
	if(_.isNull(url) || _.isUndefined(url) || !_.isString(url) || url.length <= 0) {
		return false;
	};

	// Make sure it's a valid reddit url
	return url.startsWith("https://www.reddit.com")
		|| url.startsWith("https://reddit.com")
		|| url.startsWith("http://www.reddit.com")
		|| url.startsWith("http://reddit.com");
}


var _getJsonUrl = function(url) {
	// Make sure it's a valid string
	if(_.isNull(url) || _.isUndefined(url) || !_.isString(url) || url.length <= 0) {
		return url;
	};

	// Check to see if it already ends with .json
	if(url.endsWith("/.json")) {
		return url;
	};

	if(url.endsWith("/")) {
		// Just add .json
		return url + ".json";
	} else {
		// Add trailing slash and .json
		return url + "/.json";
	}
}

module.exports = {
	isRedditUrl: _isRedditUrl,
	getJsonurl: _getJsonUrl
}