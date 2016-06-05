var _ = require('underscore');
var dbUtil = require('./dbUtil');
var Q = require('q');
var redditCore = require('./redditUtil');

function TrackedThreadsRepository(dbContext) {
	// Instantiate a new instance if needed
	if(!(this instanceof TrackedThreadsRepository)) {
		return new TrackedThreadsRepository(dbContext);
	};

	this._dataContext = dbContext;
};


TrackedThreadsRepository.prototype.getAll = function() {
	var sql = 	"SELECT rowid, url, dateAdded, tracking, numComments, numCommentsLastRead, deleted "
			+	"FROM TrackedThreads "
			+	"WHERE deleted = ?";
	var params = [false];

	return dbUtil.allPromise(this._dataContext, sql, params);
};

TrackedThreadsRepository.prototype.getAllNeedingCommentsChecked = function(maxDate) {
	var sql = 	"SELECT tt.rowid, tt.url, tt.dateAdded, tt.tracking, tt.numComments, tt.numCommentsLastRead, deleted " 
			+	"FROM TrackedThreads as tt "
			+	"WHERE tt.deleted = ? "
			+	"AND (tt.numCommentsLastRead IS NULL OR tt.numCommentsLastRead <= ?)"
	var params = [false, maxDate];

	return dbUtil.allPromise(this._dataContext, sql, params);
};

TrackedThreadsRepository.prototype.get = function(rowId) {
	var sql = 	"SELECT rowid, url, dateAdded, tracking, numComments, numCommentsLastRead, deleted "
			+	"FROM TrackedThreads "
			+	"WHERE rowid = ?";
	var params = [rowId];

	return dbUtil.getPromise(this._dataContext, sql, params);
}

TrackedThreadsRepository.prototype.add = function(url, dateAdded, tracking, deleted) {
	// make sure parameters are valid and are a reddit url
	if(redditCore.isRedditUrl(url) === false) {
		return Q.reject("Invalid url. Please provide a valid reddit url.");
	};


	var sql = "INSERT INTO TrackedThreads (url, dateAdded, tracking, deleted) VALUES (?, ?, ?, ?)";
	var params =  [url, dateAdded, tracking, deleted];

	return dbUtil.runPromise(this._dataContext, sql, params);
}


TrackedThreadsRepository.prototype.update = function(rowid, url, dateAdded, tracking, deleted, numComments, numCommentsLastRead) {
	var sql = 	"UPDATE TrackedThreads "
			+	"SET url = ?, dateAdded = ?, tracking = ?, deleted = ?, numComments = ?, numCommentsLastRead = ? "
			+	"WHERE rowid = ?";
	var params = [url, dateAdded, tracking, deleted, numComments, numCommentsLastRead, rowid];

	return dbUtil.runPromise(this._dataContext, sql, params);
}



module.exports = TrackedThreadsRepository;





