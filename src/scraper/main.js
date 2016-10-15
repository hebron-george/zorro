var scraper = require('./scraper');

scraper.scrape(`${__dirname}/names.csv`)
    .then((results) => {
        console.log('done');
    })
    .catch((err) => console.error('Error scraping', err))
