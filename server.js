const dotenv = require('dotenv');
const restify = require('restify');

dotenv.config();

const unogsApi = require('./lib/unogs');

const server = restify.createServer();
server.use(restify.plugins.queryParser());

const getUnixTimestamp = () => Math.floor(Date.now() / 1000);
const cache = new Map();

// We keep things in "cache" for 1 week.
const cacheForSeconds = 7 * 24 * 60 * 60;
function isFreshInCache(timestamp) {
  const currentTimestamp = getUnixTimestamp();
  return currentTimestamp - timestamp < cacheForSeconds;
}

server.get('/search', (req, res) => {
  const imdb = req.query.imdb;
  const title = req.query.title;
  const year = req.query.year;

  if (!imdb && (!title || !year)) {
    res.send(400, {
      error: 'Add a `imdb` or `title` + `year` query parameter.',
    });
    return;
  }

  function sendRes(data) {
    res.send({
      countries: data.countries,
      checkedAt: data.checkedAt,
    });
  }

  // Utilize cache instead of a unogs API request if it's still fresh
  const cacheKey = imdb || `${title} (${year})`;
  const cacheReq = cache.get(cacheKey);
  if (cacheReq && isFreshInCache(cacheReq.checkedAt)) {
    sendRes(cacheReq);
    return;
  }

  unogsApi({ imdb, title, year })
    .then(countryList => {
      const data = {
        countries: countryList,
        checkedAt: getUnixTimestamp(),
      };
      cache.set(cacheKey, data);
      sendRes(data);
    })
    .catch(err => {
      if (err.response) {
        const code = err.response.statusCode;
        console.log('API error', 'statusCode:', code);
        res.send(400, {
          error: `API error response code from uNogs: ${code}.`,
        });
      }
    });
});

server.listen(process.env.P2N_PORT, () => {
  console.log(`Listening at ${server.url}`);
});
