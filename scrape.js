/*
	Following this tutorial: 
	https://www.digitalocean.com/community/tutorials/how-to-use-node-js-request-and-cheerio-to-set-up-simple-web-scraping
	
	Needle:
	https://www.npmjs.com/package/needle
*/

var request = require('request');
var cheerio = require('cheerio');
var needle = require('needle');

var root_url = 'http://infogob.com.pe/Politico/politico.aspx'

request(root_url, function(error, response, html){
	if (!error && response.statusCode == 200){
		var $ = cheerio.load(html);
		console.log(html);
	}
});