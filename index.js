var express = require('express');
var bodyParser = require('body-parser');
var server = express();
server.use(bodyParser.json());

var path = require('path');
var notifier = require('node-notifier');
var nc = new notifier.NotificationCenter();

/* Database */
var db = new require('./db')("userData.db");
var trackedThreadsRepository = new require('./trackedThreadsRepository')(db.dataContext);

var redditCore = new require('./redditCore')(trackedThreadsRepository);

/* Static Content */
server.use('/css', express.static(__dirname + '/views/css'));
server.use('/fonts', express.static(__dirname + '/views/fonts'));
server.use('/img', express.static(__dirname + '/views/img'));
server.use('/js', express.static(__dirname + '/views/js'));


server.get('/', function(req, res) { 
	res.sendFile(path.join(__dirname + '/views/index.html'));
});


/* Server Util */
_apiSuccess = function(res, data) {
	res.contentType('json');
	res.send({
		data: data,
		errorMessage: ""
	});
};
_apiError = function(res, data, errorMessage) {
	res.contentType('json');
	res.status(500).send ({
		data: data,
		errorMessage: errorMessage
	});
};

/* API Routes */
server.get('/trackedThreads', function(req, res) {
	trackedThreadsRepository.getAll().then(function(result) {
		_apiSuccess(res, result);
	}, function(err) {
		_apiError(res, [], err);
	});
});

server.post('/trackedThreads', function(req, res) {
	trackedThreadsRepository.add(req.body.url, new Date(), true, false).then(function(result) {
		_apiSuccess(res, result);
	}, function(err) {
		_apiError(res, null, err);
	});
})



// Poll reddit comments every 2 minutes
setTimeout(function() {
	redditCore.checkComments().then(function(messages) { 
		for(var i = 0; i < messages.length; i++) {
			notifier.notify({
				title: "Thread Updated",
				message: messages[i].message,
				'open': messages[i].url,
				'wait': true
			});
		};
	}, function(err) {
		notifier.notify({
			'title': 'Refresh Error',
			'message': 'There was an error checking your threads.',
		});
	});
}, 2 * 60 * 1000)

/* Notifications */
notifier.notify({
	'title': 'Starting',
	'message': 'Webserver Running',
});

server.listen(3000);
