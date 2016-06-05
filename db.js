var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();


function DB(dbFileName) {
	// Instantiate a new instance if needed
	if(!(this instanceof DB)) {
		return new DB(dbFileName);
	};

	// Setup the file if needed
	var dbFileExists = fs.existsSync(dbFileName);
	if(!dbFileExists) {
		fs.openSync(dbFileName, "w");;
	};

	// Setup properties
	this.dataContext = new sqlite3.Database(dbFileName);

	// Initialize the schema
	this._initSchema();
};



DB.prototype._initSchema = function() { 
	var db = this.dataContext;

	db.serialize(function() {
		// Setup the tracked items table
		db.run("CREATE TABLE IF NOT EXISTS TrackedThreads (url VARCHAR(2048) NOT NULL, dateAdded DATETIME NOT NULL, tracking BOOLEAN NOT NULL, deleted BOOLEAN NOT NULL, numComments INTEGER, numCommentsLastRead DATETIME)");

	});
};




module.exports = DB;





