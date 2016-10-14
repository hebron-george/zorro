var fs = require('fs');

import {
    loadNamesCSV,
    scrape,
    findPersonID,
} from './scraper';

import htmlPolitico from './html/politico.html.js';

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
});
