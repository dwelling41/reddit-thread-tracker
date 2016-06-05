var _ = require('lodash');
var Q = require('q');
var request = require('request');
var redditUtil = require('./redditUtil');

	// _.difference(new, old) gives the new without deletes 

function RedditCore(trackedThreadsRepository) {
	// Instantiate a new instance if needed
	if(!(this instanceof RedditCore)) {
		return new RedditCore(trackedThreadsRepository);
	};

	this._trackedThreadsRepository = trackedThreadsRepository;
	this.dateThresholdFromCurrentInMilliseconds = 2 * 60 * 1000;
};


RedditCore.prototype.checkComments = function() {
	var deferred = Q.defer();

	var self = this;

	// Get all of the data that is older than the threshold
	var timestampThreshold = new Date().getTime() - this.dateThresholdFromCurrentInMilliseconds;
	this._trackedThreadsRepository.getAllNeedingCommentsChecked(timestampThreshold)
		.then(this._getCommentsToCheckSuccess.bind(this, deferred), this._getCommentsToCheckFailure.bind(this, deferred))
		.then(function(allResults) {
			// Exit if no results
			if(_.isNull(allResults) || _.isUndefined(allResults) || allResults.length <= 0) {
				deferred.resolve([]);
				return deferred.promise;
			};

			// Parse the results and return all of the messages for found items
			var messages = [];

			for(var i = 0; i < allResults.length; i++) {
				var curItem = allResults[i];
				// Check to see if the new # of comments is greater than our existing
				var newCommentFound = ( _.isNull(curItem.trackedThread.numComments) && curItem.numComments > 0 )
					|| (!_.isNull(curItem.trackedThread.numComments) && curItem.trackedThread.numComments != curItem.numComments);
				if(newCommentFound == false) {
					continue;
				};

				// Alert the user and update the item
				self._trackedThreadsRepository.update(curItem.trackedThread.rowid, curItem.trackedThread.url, curItem.trackedThread.dateAdded, 
					curItem.trackedThread.tracking, curItem.trackedThread.deleted, curItem.numComments, curItem.dateRead);

				messages.push({
					message: "The thread " + curItem.trackedThread.url + " has been updated! Click here to view it.",
					url: curItem.trackedThread.url
				})
			};

			deferred.resolve(messages);

		}, function() {
			deferred.reject("There was an error getting all of the comment data.");
		})

	return deferred.promise;
}

RedditCore.prototype._getCommentsToCheckSuccess = function(deferred, results) {
	// Go through each of the results and get all of their remote data
	var getCommentDataPromises = [];

	if(_.isNull(results) || _.isUndefined(results)) {
		return Q.all(getCommentDataPromises);
	};

	for(var i = 0; i < results.length; i++) {
		var curTrackedThread = results[i];
		var getNumCommentsPromise = this._getNumComments(curTrackedThread);
		getCommentDataPromises.push(getNumCommentsPromise);
	}

	return Q.all(getCommentDataPromises);
}

RedditCore.prototype._getCommentsToCheckFailure = function(deferred, err) {
	deferred.reject("There was an error getting the tracked data: " + err);
}

RedditCore.prototype._getNumComments = function(curTrackedThread) {
	var deferred = Q.defer();

	// Parse out the correct url
	var url = redditUtil.getJsonurl(curTrackedThread.url);

	// Hit the request url
	request(url, function (error, response, body) {
		// make sure the request is valid
		var isValidResponse = !error && response.statusCode == 200;
		if(!isValidResponse) {
			deferred.reject("There was an error parsing the url.");
			return deferred.promise;
		};

		// parse out the json and make sure it is valid
		var parsedJson = JSON.parse(body);
		if(_.isNull(parsedJson) || _.isUndefined(parsedJson) || parsedJson.length < 1 ) {
			deferred.reject("The data did not contain the comments portion.");
			return deferred.promise;
		};

		// Get the number of comments
		var numComments = _.get(parsedJson[0], 'data.children[0].data.num_comments');
		deferred.resolve({
			trackedThread: curTrackedThread,
			numComments: numComments,
			dateRead: new Date()
		});
	});

	return deferred.promise;
}

module.exports = RedditCore;





