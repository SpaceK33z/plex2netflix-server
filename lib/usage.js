const fs = require('fs');

const PATH = './stats.json';

// Write how many times the bot was used per day to a file.
module.exports = function (options) {
    fs.readFile(PATH, 'utf8', (err, data) => {
        let stats = {};
        if (data) {
            stats = JSON.parse(data);
        }

        // Get the date like YYYY-MM-DD
        const date = (new Date()).toISOString().slice(0, 10);

        if (!stats[date]) {
            stats[date] = { cache: 0, api: 0 };
        }
        stats[date][options.cache ? 'cache' : 'api'] += 1;

        fs.writeFile(PATH, JSON.stringify(stats), (err2) => {
            if (err2) throw err2;
        });
    });
};
