var scraper = require('./scraper');

scraper.scrape(`${__dirname}/names.test.csv`)
    .then((results) => {
        console.log('done');
        console.log(results);
    })
    .catch((err) => console.error('Error scraping', err))
