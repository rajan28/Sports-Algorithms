var express = require('express');
var compress = require('compression');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');


module.exports = function() {
	var app = express();

	if (process.env.NODE_ENV === 'development') {
		app.use(morgan('dev')); //logger
	};
	if (process.env.NODE_ENV === 'production') {
		app.use(compress());
	};

	app.use(bodyParser.urlencoded( {
		extended : true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	app.set('views', './server/views');
	app.set('view engine', 'ejs');

	app.get('/scrape', function(req, res){
		// Let's scrape Anchorman 2
		url = 'http://www.imdb.com/title/tt0804503/';

		request(url, function(error, response, html){
			if(!error){
				var $ = cheerio.load(html);

				var title, release, rating;
				var json = { title : "", release : "", rating : ""};

				$('.header').filter(function(){
			        var data = $(this);
			        title = data.children().first().text();
			        release = data.children().last().children().text();

			        json.title = title;
			        json.release = release;
		        })

		        $('.star-box-giga-star').filter(function(){
		        	var data = $(this);
		        	rating = data.text();

		        	json.rating = rating;
		        })
			}

			fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
	        	console.log('File successfully written! - Check your project directory for the output.json file');
	        });

	        res.redirect('/#!/results');
		});
	});


	app.use(express.static('./client'));

	app.all('/*', function(req, res, next) {
	    // Just send the index.html for other files to support HTML5Mode
	    res.sendFile('index.html', {
	    	root: './dist'
	    });
	});

	return app;
};