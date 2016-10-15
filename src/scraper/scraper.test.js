var fs = require('fs');

import {
    loadNamesCSV,
    scrape,
    findPersonID,
    getHtmlFileName,
    saveHtml,
    getPoliticoHtml,
    getResumeLink,
} from './scraper';

import htmlPolitico from './html/politico.html.js';
import htmlFichaTab1 from './html/ficha-tab1.html.js';

describe('scraper', () => {
    describe('loadNamesCSV', () => {
        it('should load the csv', () => {
            return loadNamesCSV(`${__dirname}/names.test.csv`)
                .then((result) => {
                    expect(result).toMatchSnapshot();
                });
        });
    });

    describe('findPersonID', () => {
        it('find the person id in the html', () => {
            expect(findPersonID(htmlPolitico)).toMatchSnapshot();
        });
    });

    describe('getHtmlFileName', () => {
        it('formats the html file name', () => {
            const fileType = 'resume';
            const person = {
                apellido_materno: 'ALVARADO',
                apellido_paterno: 'ABAD',
                nombres: 'THALIA',
                rowid: 1,
            };
            const personId = 666;
            expect(getHtmlFileName(fileType, person, personId)).toMatchSnapshot();
        });
    });

    describe('saveHtml', () => {
        it('creates a file and doesnt blow up', () => {
            const fileType = 'resume';
            const person = {
                apellido_materno: 'ALVARADO',
                apellido_paterno: 'ABAD',
                nombres: 'THALIA',
                rowid: 1,
            };
            const personId = 666;
            return saveHtml(fileType, person, personId, 'asdf');
        });
    });

    describe('getPoliticoHtml', () => {
        xit('should actually make a request and return the html', () => {
            const person = {
                apellido_materno: 'ALVARADO',
                apellido_paterno: 'ABAD',
                nombres: 'THALIA',
                rowid: 1,
            };

            return getPoliticoHtml(person)
                .then((html) => {
                    expect(html).toContain('ficha.aspx');
                })
        })
    });

    describe('getResumeLink', () => {
        it('should find the resume link for 2014', () => {
            expect(getResumeLink(htmlFichaTab1)).toMatchSnapshot();
        })
    });
});
