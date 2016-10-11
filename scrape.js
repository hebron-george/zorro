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

fs.createReadStream(csv_file).pipe(converter);

converter.on('end_parsed', function(jsonArray) {
	people = jsonArray;
});

data = {
"__LASTFOCUS":"",
"__EVENTTARGET":"",
"__EVENTARGUMENT":"",
"__VIEWSTATE":"4IYUGigpbH8p7Q4dF9upEfAVdrMI7PSRdyzEJeLNZ3eRMqBETXfakFjpo04lvBjDjitY4n4HJD/X9sXhNv1GGnuOKuMrdL2Cinu+TvodhKVFl/le8fsC3isTxFdivWs2RsWkow1v5r1E8oOt41nDbuDKOjMt+O96Kbn+kmmZEbk/touvZAKjw0cIm2+2U0a1wFsfj5eXY1W7W0Wm5WDX4lpo4KhLeI8eYsOmpqAl2RXxwCf1IHLmdbwzN7rSPsAFpYvVW7/TsXB4Ax8hB4HqOIKnpLYsnnFZko+BbuYhobQgB1Nlk/NDC2wte7DltVQ6r1Cl7GmBRzSmBXpFSkbLyxS6YWjYYU0QF76WVz7PEnqFLzhAYdFHcHcNxVGoyM/cnFyvtaTNa/ehysIAratEXYeG0qa+8uKzQHrSeOirtpgBJ10VQICgdA9tj3ebhB9RJ9BIMMvsvE65amIBZbrbThzsiBjTvc0IDq/PuurGp7k=",
"__VIEWSTATEGENERATOR":"E4FBEFF6",
"__VIEWSTATEENCRYPTED":"",
"__EVENTVALIDATION":"HmbP01Ix0HdcKhCdouyXYR4nT4kDhwjl536z+KEl84ckiWzZrLpKHwA8C8lveqyeAE62/8QnifCkKH8K79Yplo1GxZXN4IaLTnZN6dhY9U1mnaOfpvjeyQ9bKdCx+biJ61jR5wtxx08l7hrenGUQQQ==",
"ctl00$ContentPlaceHolder1$txt_nombres":"THALIA",
"ctl00$ContentPlaceHolder1$txt_paterno":"ABAD",
"ctl00$ContentPlaceHolder1$txt_materno":"ALVARADO",
"ctl00$ContentPlaceHolder1$txt_dni":"",
"ctl00$ContentPlaceHolder1$ImgBtnAceptar.x":"36",
"ctl00$ContentPlaceHolder1$ImgBtnAceptar.y":"10"
}

request(root_url, data, function(error, response, html){
	if (!error && response.statusCode == 200){
		var $ = cheerio.load(html);
		//console.log(html);
		console.log(html)
	}
});
