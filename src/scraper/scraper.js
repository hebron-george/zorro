const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const needle = require('needle');
const Converter = require('csvtojson').Converter;

const root_url = 'http://infogob.com.pe/Politico/politico.aspx';

function scrape(csvFilePath) {
    return loadNamesCSV(csvFilePath)
        .then((names) => {
            const batches = chunk(names, 100);
        })
}

function loadNamesCSV(csvFilePath) {
    return new Promise((resolve, reject) => {
        const converter = new Converter({});
        converter.on('end_parsed', (jsonArray) => resolve(jsonArray));
        converter.on('error', (err) => reject(err));

        const stream = fs.createReadStream(csvFilePath);
        stream.on('error', (err) => reject(err));
        stream.pipe(converter);
    });
}

module.exports = {
    scrape,
    loadNamesCSV,
};
