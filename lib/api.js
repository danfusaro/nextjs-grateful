'use strict';
import path from 'path'
import csvdb from 'node-csv-query';

const dataDirectory = path.join(process.cwd(), 'data');
const apiBase = 'https://api.relisten.net/api/v2/artists/grateful-dead';
const defaultParams = { method: 'GET', headers: { 'Content-Type': 'application-json' } };
let csv;

export const getYears = async () => {
    const result = await fetch(`${apiBase}\\years`, defaultParams);
    return await result.json();
}

export const getYear = async (year) => {
    const result = await fetch(`${apiBase}\\years\\${year}`, defaultParams);
    const json = await result.json();
    const shows = await Promise.all(json.shows.map(async show => {
        const venue = show.venue ? await getVenue(show.venue) : {};
        return { ...show, venue }
    }));
    json.shows = shows.filter(s => !isNaN(s.venue.longitude) && !isNaN(s.venue.latitude));
    json.show_count = json.shows.length;
    return json;
}

const getVenue = async rawVenue => {
    if (!csv) {
        csv = await new Promise(resolve => csvdb(`${dataDirectory}/us_long_lat.csv`).then(db => resolve(db)));
    }
    const { location = '' } = rawVenue;
    const { longitude = NaN, latitude = NaN } = Object(await getLongLat(csv, location));
    return { ...rawVenue, latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
}

export const getLongLat = async (csv, cityStateCountry) => {
    const [city, state] = cityStateCountry.split(',').map(x => x.trim().toLowerCase());
    if (city && state) {
        // Shockingly GD venue location data is a little messy, cleaning up best we can here.
        let city2 = city.replace(new RegExp('early |late | show', 'gi'), '');
        return await csv.findOne(record => {
            return record.city.toLowerCase().indexOf(city2) > -1 && state === record.state.toLowerCase();
        })
    }
    return null;
}

export const getShow = async (year, display_date) => {
    const result = await fetch(`${apiBase}\\years\\${year}\\${display_date}`, defaultParams);
    const json = await result.json();
    // Get only highest quality source
    const tracks = json.sources.reduce((p, c, i) => {
        if (c.avg_rating > p.avg_rating) {
            return c;
        }
        return p;
    })
    return { date: json.date, venue: json.venue.name, tracks, id: json.id };
}