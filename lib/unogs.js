const got = require('got');

const unogsApiKey = process.env.P2N_UNOGS_API_KEY;

module.exports = function ({ imdb, title, year }) {
    return got('http://unogs.com/cgi-bin/imdbtitle.cgi', {
        json: true,
        query: {
            imdb,
            title: !imdb ? title : null,
            year: !imdb ? year : null,
            api: unogsApiKey,
        },
    }).then((data) => {
        if (!data.body || !data.body.RESULT || !data.body.RESULT.country) {
            return [];
        }
        return data.body.RESULT.country.map((country) => {
            return country[1];
        });
    });
};
