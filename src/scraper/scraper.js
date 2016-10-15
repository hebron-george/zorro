const lodash = require('lodash');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const needle = require('needle');
const Converter = require('csvtojson').Converter;
const batchPromises = require('batch-promises');


const root_url = 'http://infogob.com.pe/Politico/politico.aspx';

function scrape(csvFilePath) {
    return loadNamesCSV(csvFilePath)
        .then((persons) => {
            const batchSize = 10;
            return batchPromises(batchSize, persons, (person) => doTheWork(person));
        });
}

function doTheWork(person) {
    console.log(`Working on person ${person.nombres}-${person.apellido_paterno}-${person.apellido_materno}`);

    return getPoliticoHtml(person)
        .then((politicoHtml) => {
            const personID = findPersonID(politicoHtml)
            return saveHtml('politico', person, personID, politicoHtml)
                .then(() => personID);
        })
        .then((personID) => {
            return Promise.all([getFichaTab0Html(personID), getFichaTab1Html(personID)])
                .then(([fichaTab0Html, fichaTab1Html]) => {
                    return saveHtml('fichaTab0', person, personID, fichaTab0Html)
                        .then(() => saveHtml('fichaTab1', person, personID, fichaTab1Html))
                        .then(() => {
                            const resumeLink = getResumeLink(fichaTab1Html)
                            if (resumeLink) {
                                return getResumeHtml(resumeLink);
                            }
                            return Promise.resolve('Not found');
                        })
                        .then((resumeHtml) => saveHtml('resume', person, personID, resumeHtml));
                });
        })
}

function getHtmlFileName(fileType, person, personID) {
    return `${fileType}-${personID}-${person.nombres}-${person.apellido_paterno}-${person.apellido_materno}.html`;
}

function saveHtml(fileType, person, personID, html) {
    return new Promise((resolve, reject) => {
        const filename = getHtmlFileName(fileType, person, personID);

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

            request.post({url: 'http://infogob.com.pe/Politico/politico.aspx', form: data}, (err, res, html) => {
                console.log('POST politico.aspx: ' + res.statusCode);
                if (err || res.statusCode !== 200) {
                    return reject(err);
                }
                return resolve(html);
        	});
        });
    });
}

function findPersonID(html) {
    const myregex = /ficha\.aspx\?IdPolitico=(\d+)/ig;
    const match = myregex.exec(html);
    return Number(match[1]);
}

function getFichaTab0Html(personID) {
    return new Promise((resolve, reject) => {
        const url = `http://infogob.com.pe/Politico/ficha.aspx?IdPolitico=${personID}&IdTab=0`;
        request(url, (err, res, html) => {
            console.log(`GET /ficha.aspx tab 0: ${res.statusCode}`)
            if (err || res.statusCode !== 200) {
                return reject(err);
            }
            return resolve(html);
        })
    })
}

function getFichaTab1Html(personID) {
    return new Promise((resolve, reject) => {
        const url = `http://infogob.com.pe/Politico/ficha.aspx?IdPolitico=${personID}&IdTab=1`;
        request(url, (err, res, html) => {
            console.log(`GET /ficha.aspx tab 1: ${res.statusCode}`)
            if (err || res.statusCode !== 200) {
                return reject(err);
            }
            return resolve(html);
        })
    })
}

function getResumeLink(fichaTab1HTML) {
    var $ = cheerio.load(fichaTab1HTML);
    const rowsMatching2014 = $(".mygrid tr").filter((i, el) => {
        const html = $(el).html();
        return html.indexOf('MUNICIPALES 2014') !== -1;
    });

    if (rowsMatching2014.length === 0) {
        return null;
    }

    const links = $(rowsMatching2014[0])
        .find('a')
        .map((i, el) => $(el).attr('href'))
        .toArray();

    return links.find((link) => link.indexOf('HojaVida') !== -1);
}

function getResumeHtml(resumeLink) {
    return new Promise((resolve, reject) => {
        request(resumeLink, (err, res, html) => {
            console.log(`GET resume: ${res.statusCode}`)
            if (err || res.statusCode !== 200) {
                return reject(err);
            }
            return resolve(html);
        })
    })
}

module.exports = {
    scrape,
    loadNamesCSV,
    findPersonID,
    getHtmlFileName,
    saveHtml,
    doTheWork,
    getPoliticoHtml,
    getFichaTab0Html,
    getResumeLink,
};
