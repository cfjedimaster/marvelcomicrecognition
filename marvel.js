/* global require,exports, console */
var http = require('http');
var crypto = require('crypto');

var cache = [];

var IMAGE_NOT_AVAIL = "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available";

var cred = require('./credentials.json');
var PRIV_KEY = cred.marvel.privkey;
var API_KEY = cred.marvel.apikey;

function search(s,cb) {
	
	var url = "http://gateway.marvel.com/v1/public/comics?limit=25&format=comic&formatType=comic&title="+s+"&apikey="+API_KEY;
	var ts = new Date().getTime();
	var hash = crypto.createHash('md5').update(ts + PRIV_KEY + API_KEY).digest('hex');
	url += "&ts="+ts+"&hash="+hash;
	console.log("url "+url);

	if(s in cache) {
		console.log("had a cache for "+s);
		cb(cache[s]);
		return;
	}
	
	http.get(url, function(res) {
		var body = "";

		res.on('data', function (chunk) {
			body += chunk;
		});
		
		res.on('end', function() {

			var result = JSON.parse(body);
			var images;
			
			if(result.code === 200) {
				images = [];
				console.log('num of comics '+result.data.results.length);
				for(var i=0;i<result.data.results.length;i++) {
					var comic = result.data.results[i];
					//console.dir(comic);
					if(comic.thumbnail && comic.thumbnail.path != IMAGE_NOT_AVAIL) {
						var image = {};
						image.title = comic.title;
						for(x=0; x<comic.dates.length;x++) {
							if(comic.dates[x].type === 'onsaleDate') {
								image.date = new Date(comic.dates[x].date);
							}
						}
						image.url = comic.thumbnail.path + "." + comic.thumbnail.extension;
						if(comic.urls.length) {
							for(var x=0; x<comic.urls.length; x++) {
								if(comic.urls[x].type === "detail") {
									image.link = comic.urls[x].url;
								}
							}
						}
						images.push(image);
					}
				}
				
				var data = {images:images,attribution:result.attributionHTML};
				cache[s] = data;
				cb(data);
			} else if(result.code === "RequestThrottled") {
				console.log("RequestThrottled Error");
				/*
				So don't just fail. If we have a good cache, just grab from there
				*/
				//fail for now 
				poop;
				/*
				if(Object.size(cache) > 5) {
					var keys = [];
					for(var k in cache) keys.push(k);
					var randomCacheKey = keys[getRandomInt(0,keys.length-1)];
					images = cache[randomCacheKey].images;
					cache[randomCacheKey].hits++;
					cb(images[getRandomInt(0, images.length-1)]);		
				} else {
					cb({error:result.code});
				}
				*/
			} else {
				console.log(new Date() + ' Error: '+JSON.stringify(result));
				cb({error:result.code});
			}
			//console.log(data);
		});
	
	});

}

exports.search = search;