/*
	Following this tutorial: 
	https://www.digitalocean.com/community/tutorials/how-to-use-node-js-request-and-cheerio-to-set-up-simple-web-scraping
	
	Needle:
	https://www.npmjs.com/package/needle
*/
var fs = require('fs');

var request = require('request');
var cheerio = require('cheerio');
var needle = require('needle');

var Converter = require('csvtojson').Converter;
var converter = new Converter({});

var root_url = 'http://infogob.com.pe/Politico/politico.aspx';
var csv_file = 'names_20161004.csv';

var people;
var viewstate, viewstategenerator, eventvalidation;

var count = 0;


converter.on('end_parsed', function(jsonArray) {
	people = jsonArray;
	console.log('Finished parsing csv file');
	printeveryone();
});
fs.createReadStream(csv_file).pipe(converter);
function printeveryone(){
	people.forEach( function (person) {
		if (count++ == 0) {
			request.get(root_url, function(error, response, html){
				if (!error && response.statusCode == 200) {
					var $ = cheerio.load(html);
					var input_tags = $('input').get();
					input_tags.forEach(function(tag){
						if (tag.attribs.name == '__VIEWSTATE'){ viewstate = tag.attribs.value; } else
						if (tag.attribs.name == '__EVENTVALIDATION'){ eventvalidation = tag.attribs.value; } else
						if (tag.attribs.name == '__VIEWSTATEGENERATOR'){ viewstategenerator = tag.attribs.value}	
					});
					console.log('Got the following for person ' + person.rowid + ':');
					postPerson(person.nombres, person.apellido_paterno, person.apellido_materno, viewstate, viewstategenerator, eventvalidation);
				}
				return;
			});
		}
	} );	
}



function postPerson(nombre, paterno, materno, vs, vsg, ev){
	console.log('Inside postPerson() with nombre: %s, paterno: %s, and materno: %s', nombre, paterno, materno);
	data = {
		"__LASTFOCUS":"",
		"__EVENTTARGET":"",
		"__EVENTARGUMENT":"",
		"__VIEWSTATE":vs,
		"__VIEWSTATEGENERATOR":vsg,
		"__VIEWSTATEENCRYPTED":"",
		"__EVENTVALIDATION":ev,
		"ctl00$ContentPlaceHolder1$txt_nombres":nombre,
		"ctl00$ContentPlaceHolder1$txt_paterno":paterno,
		"ctl00$ContentPlaceHolder1$txt_materno":materno,
		"ctl00$ContentPlaceHolder1$txt_dni":"",
		"ctl00$ContentPlaceHolder1$ImgBtnAceptar.x":"36",
		"ctl00$ContentPlaceHolder1$ImgBtnAceptar.y":"10"
	}

	request.post(root_url, data, function(error, response, html){
		console.log('Status code: ' + response.statusCode);
		if(!error && response.statusCode == 200){
			var $ = cheerio.load(html);
			$('rowestillo').filter(function(){
				var d = $(this);
				console.log('Here is d printed out:');
				console.log(d.text());
			});
		} else {
			console.log('Error was set: %s', error);
		}
	});

}