const dotenv = require('dotenv');
const restify = require('restify');

dotenv.config();

const unogsApi = require('./lib/unogs');
const addUsage = require('./lib/usage');

const server = restify.createServer();
server.use(restify.queryParser());

const getUnixTimestamp = () => Math.floor(Date.now() / 1000);
const cache = new Map();

// We keep things in cache for 1 week.
const cacheForSeconds = 7 * 24 * 60 * 60;
function isFreshInCache(timestamp) {
    const currentTimestamp = getUnixTimestamp();
    return (currentTimestamp - timestamp) < cacheForSeconds;
}

server.get('/search', (req, res) => {
    const imdb = req.query.imdb;

    if (!imdb) {
        res.send(400, { error: 'Add a `imdb` query parameter' });
    }

    function sendRes(data) {
        res.send({
            countries: data.countries,
            checkedAt: data.checkedAt,
        });
    }

    // Utilize cache instead of a unogs API request if it's still fresh
    const cacheReq = cache.get(imdb);
    if (cacheReq && isFreshInCache(cacheReq.checkedAt)) {
        sendRes(cacheReq);
        addUsage({ cache: true });
        return;
    }

    unogsApi(imdb)
    .then((countryList) => {
        const data = {
            countries: countryList,
            checkedAt: getUnixTimestamp(),
        };
        cache.set(imdb, data);
        addUsage({ cache: false });
        sendRes(data);
    })
    .catch((err) => {
        console.log('API error', err && err.response);
    });
});

server.listen(process.env.P2N_PORT, () => {
    console.log(`Listening at ${server.url}`);
});
