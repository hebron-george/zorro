import {
    asdf,
    loadNamesCSV,
} from './scraper';

describe('scraper', () => {
    describe('loadNamesCSV', () => {
        it('should load the csv', () => {
            return loadNamesCSV(`${__dirname}/names.test.csv`)
                .then((result) => {
                    expect(result).toMatchSnapshot();
                })
        });
    });
    //
    // describe('', () => {
    //
    // });

});
