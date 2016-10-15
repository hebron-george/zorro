const lodash = require('lodash');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const needle = require('needle');
const Converter = require('csvtojson').Converter;

const root_url = 'http://infogob.com.pe/Politico/politico.aspx';

function scrape(csvFilePath) {
    return loadNamesCSV(csvFilePath)
        .then((persons) => {
            const promises = persons.map(
                (person) => doTheWork(person)
            );

            return Promise.all(promises);
        });
}

function doTheWork(person) {
    return getPoliticoHtml(person)
        .then((politicoHtml) => {
            const personID = findPersonID(politicoHtml)
            return saveHtml('politico', person, personID, politicoHtml)
                .then(() => personID);
        })
        // .then((personID) => {
        //     return Promise.all([getFichaTab0Html(personID), getFichaTab1Html(personID)])
        //         .then((fichaTab0Html, fichaTab1Html) => {
        //             return saveHtml('fichaTab0', person, personId, fichaTab0Html)
        //                 .then(() => saveHtml('fichaTab1', person, personId, fichaTab1Html))
        //                 .then(() => getResumeHtml(getResumeLink(fichaTab1HTML)))
        //                 .then((resumeHtml) => saveHtml('resume', person, personId, resumeHtml));
        //         });
        // })
}

function getHtmlFileName(fileType, person, personId) {
    return `${fileType}-${personId}-${person.nombres}-${person.apellido_paterno}-${person.apellido_materno}.html`;
}

function saveHtml(fileType, person, personId, html) {
    return new Promise((resolve, reject) => {
        const filename = getHtmlFileName(fileType, person, personId);

        fs.writeFile(`${__dirname}/results/${filename}`, html, (err) => {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
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

function getPoliticoHtml(person) {
    return new Promise((resolve, reject) => {
        request.get('http://infogob.com.pe/Politico/politico.aspx', (err, res, html) => {
            console.log('GET politico.aspx: ' + res.statusCode);
            if (err || res.statusCode !== 200) {
                return reject(err);
            }

            const $ = cheerio.load(html);
            const input_tags = $('input').get();
            let viewstate, eventvalidation, viewstategenerator;

            input_tags.forEach(function(tag) {
                if (tag.attribs.name == '__VIEWSTATE'){
                    viewstate = tag.attribs.value;
                }
                else if (tag.attribs.name == '__EVENTVALIDATION') {
                    eventvalidation = tag.attribs.value;
                }
                else if (tag.attribs.name == '__VIEWSTATEGENERATOR') {
                    viewstategenerator = tag.attribs.value;
                }
            });

            const data = {
        		'__LASTFOCUS': '',
        		'__EVENTTARGET': '',
        		'__EVENTARGUMENT': '',
        		'__VIEWSTATE': viewstate,
        		'__VIEWSTATEGENERATOR': viewstategenerator,
        		'__VIEWSTATEENCRYPTED': '',
        		'__EVENTVALIDATION': eventvalidation,
        		'ctl00$ContentPlaceHolder1$txt_nombres': person.nombres,
        		'ctl00$ContentPlaceHolder1$txt_paterno': person.apellido_paterno,
        		'ctl00$ContentPlaceHolder1$txt_materno': person.apellido_materno,
        		'ctl00$ContentPlaceHolder1$txt_dni': '',
        		'ctl00$ContentPlaceHolder1$ImgBtnAceptar.x': '36',
        		'ctl00$ContentPlaceHolder1$ImgBtnAceptar.y': '10'
        	};

            request.post({url: 'http://infogob.com.pe/Politico/politico.aspx', form: data}, (err, res, wef) => {
                console.log('POST politico.aspx: ' + res.statusCode);
                if (err || res.statusCode !== 200) {
                    return reject(err);
                }
                return resolve(wef);
        	});
        });
    });
}

function findPersonID(html) {
    const myregex = /ficha\.aspx\?IdPolitico=(\d+)/ig;
    const match = myregex.exec(html);
    return Number(match[1]);
}

module.exports = {
    scrape,
    loadNamesCSV,
    findPersonID,
    getHtmlFileName,
    saveHtml,
    doTheWork,
    getPoliticoHtml,
};
