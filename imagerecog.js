var fs = require('fs');
var http = require('http');
var watson = require('watson-developer-cloud');

var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();
var imageRecogCred = appEnv.getService("visual_recognition");

if(!imageRecogCred) {
	var cred = require('./credentials.json');
	var visual_recognition = watson.visual_recognition({
		username: cred.vr.username,
		password: cred.vr.password,
		version: 'v1'
	});
} else {
	var visual_recognition = watson.visual_recognition({
		version: 'v1',
		use_vcap_services:true
	});
}

var cache = {};

function scan(url, cb) {

	//create a temp file name based on last 3 items from url: http://i.annihil.us/u/prod/marvel/i/mg/a/03/526ff00726962.jpg
	var parts = url.split("/");
	var tmpFilename = "./temp/" + parts[parts.length-3] + "_" + parts[parts.length-2] + "_" + parts[parts.length-1];

	if(tmpFilename in cache) {
		console.log('image scan from cache');
		cb(cache[tmpFilename]);
		return;
	}
	// download file then we can use fs.createReadableStream
	var file = fs.createWriteStream(tmpFilename);

	http.get(url, function(response) {
	    response.pipe(file);
	    file.on('finish', function() {
			file.close();
			var params = {
				image_file: fs.createReadStream(tmpFilename)
			};
	
			visual_recognition.recognize(params, function(err, result) {
				if (err) {
					console.log("visual recog error",err);
					cb({"error":1})
				} else {
					//console.log(JSON.stringify(result));
					var tags = [];
					for(var i=0; i<result.images[0].labels.length; i++) {
						tags.push(result.images[0].labels[i]);
					}
					cache[tmpFilename] = tags;
					cb(tags);
				}
			});

	    });
	});
	
}


exports.scan = scan;