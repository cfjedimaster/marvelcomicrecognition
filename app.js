/*jshint node:true*/


var express = require('express');

var bodyParser = require('body-parser');


var marvel = require('./marvel');
var imagerecog = require('./imagerecog');


// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

/*
app.engine('dust', consolidate.dust);
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');
*/
app.use(express.static(__dirname + '/public', {redirect: false}));
 
app.use(bodyParser());
 
// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, appEnv.bind, function() {
	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

app.post('/search', function(req, res) {
	
	var term = req.body.q;
	console.log('search for '+term);
	marvel.search(term,function(covers) {
		res.send(covers);
	});
	
});

app.post('/imagescan', function(req, res) {
	var url = req.body.url;
	console.log('scan for '+url);
	imagerecog.scan(url, function(result) {
		res.send(result);
	});
});
