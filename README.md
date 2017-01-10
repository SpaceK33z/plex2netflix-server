# plex2netflix Server

This is the server part for [plex2netflix](https://github.com/SpaceK33z/plex2netflix).

It does one simple thing: a request to an external API to check if an IMDb ID or movie title+year is available on Netflix. It then caches the result of the external API for a while, to prevent hammering it.

The external API is graciously provided by [**uNoGS**](http://unogs.com/).

## Install

1. Copy `.env.example` to `.env` and fill in your uNoGS API key.
2. `npm install` or `yarn`.
3. `npm start`.
