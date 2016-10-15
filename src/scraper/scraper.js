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
    return new Promise((resolve, reject) => {
        getPoliticoHtml(person)
            .then((politicoHtml) => {
                const personID = getPersonID(politicoHtml)
                saveHtml('politico', person, personId, politicoHtml);
                return personID;
            })
            .then((personID) => {
                return Promise.all([getFichaTab0Html(personID), getFichaTab1Html(personID)])
                    .then((fichaTab0Html, fichaTab1Html) => {
                        return saveHtml('fichaTab0', person, personId, fichaTab0Html)
                            .then(() => saveHtml('fichaTab1', person, personId, fichaTab1Html))
                            .then(() => getResumeHtml(getResumeLink(fichaTab1HTML)))
                            .then((resumeHtml) => saveHtml('resume', person, personId, resumeHtml));
                    });
            });
    });
}

function getHtmlFileName(fileType, person, personId) {
    return `${fileType}-${personId}-${person.nombres}-${person.apellido_paterno}-${person.apellido_materno}.html`;
}

function saveHtml(fileType, person, personId, html) {
    return new Promise((resolve, reject) => {
        const filename = getHtmlFileName(fileType, person, personId);

        fs.writeFile(`${__dirname}/results/${filename}`, data, (err) => {
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

function getPoliticoHtml() {
    return new Promise((resolve, reject) => {
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
    doTheWork,
};
