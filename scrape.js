/*
	Following this tutorial: 
	https://www.digitalocean.com/community/tutorials/how-to-use-node-js-request-and-cheerio-to-set-up-simple-web-scraping
	
	Needle:
	https://www.npmjs.com/package/needle
*/

var request = require('request');
var cheerio = require('cheerio');
var needle = require('needle');
var csv = require('fast-csv');
var fs = require('fs');
var path = require('path');
var sleep = require('sleep');

var root_url = 'http://infogob.com.pe/Politico/politico.aspx';
var csv_file = 'names_20161004.csv';
var people = [];

fs.readFile(path.join(__dirname, csv_file), {encoding: 'utf-8'}, function(err, data){
	if(!err){
		read_names_from_csv(data);
	} else{
		console.log(err);
	}
});

request(root_url, function(error, response, html){
	if (!error && response.statusCode == 200){
		var $ = cheerio.load(html);
		//console.log(html);
	}
});

function read_names_from_csv(data){
	console.log("Reading names from csv file");
	csv
		.fromPath(csv_file)
		.on("data", function(data){
			people.push(data);
			//console.log('One piece of data:');
			//console.log(data[1]);
		})
		.on("end", function(){
			console.log("Done collecting.");
			console.log(people);
			sleep.sleep(100000000000000000);
			return;
		})
	console.log("Finished reading names from csv file");
}