const fs = require('fs');

const PATH = './stats.json';

let stats = {};

fs.readFile(PATH, 'utf8', (err, data) => {
  if (data) {
    stats = JSON.parse(data);
  }
});

// We write to disk with an interval because this API needs to handle many many
// requests per second. Writing to disk for every request introduces weird errors.
const SAVE_INTERVAL = 1000 * 60 * 60 * 5;
setInterval(() => {
  if (Object.keys(stats).length === 0) {
    return;
  }
  fs.writeFile(PATH, JSON.stringify(stats), err => {
    if (err) throw err;
  });
}, SAVE_INTERVAL);

// Write how many times the bot was used per day to a file.
module.exports = function(options) {
  // Get the date like YYYY-MM-DD
  const date = new Date().toISOString().slice(0, 10);

  if (!stats[date]) {
    stats[date] = { cache: 0, api: 0 };
  }
  stats[date][options.cache ? 'cache' : 'api'] += 1;
};
