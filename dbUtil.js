var Q = require('q');

module.exports = {
	runPromise: function(dataContext, sql, params) {
		var deferred = Q.defer();

		dataContext.run(sql, params, function(err) {

			if(err) {
				console.log('uh', err);
				deferred.reject(err);
			} else {
				deferred.resolve({
					lastId: this.lastID, 
					changes: this.changes
				});
			}
		});

		return deferred.promise;
	},

	allPromise: function(dataContext, sql, params) {		
		var deferred = Q.defer();

		dataContext.all(sql, params, function(err, rows) {
			if(err) {
				deferred.reject(err);
			} else {
				deferred.resolve(rows);
			}
		});

		return deferred.promise;
	},


	getPromise: function(dataContext, sql, params) {		
		var deferred = Q.defer();

		dataContext.get(sql, params, function(err, rows) {
			if(err) {
				deferred.reject(err);
			} else {
				deferred.resolve(rows);
			}
		});

		return deferred.promise;
	}
}