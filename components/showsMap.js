import { createRef, useEffect, useRef, useState } from 'react';
import scriptLoader from 'react-async-script-loader'
import { ratingToColor } from '../utils/color';

const drawRoute = (api, locs) => {
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', () => {
        var directionsManager = new Microsoft.Maps.Directions.DirectionsManager(api);
        //directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('printoutPanel') });
        directionsManager.setRequestOptions({
            routeMode: Microsoft.Maps.Directions.RouteMode.truck,
            vehicleSpec: {
                dimensionUnit: 'ft',
                weightUnit: 'lb',
                vehicleHeight: 5,
                vehicleWidth: 3.5,
                vehicleLength: 30,
                vehicleWeight: 30000,
                vehicleAxles: 3,
                vehicleTrailers: 2,
                vehicleSemi: true,
                vehicleMaxGradient: 10,
                vehicleMinTurnRadius: 15,
                vehicleAvoidCrossWind: true,
                vehicleAvoidGroundingRisk: true,
                vehicleHazardousMaterials: 'F',
                vehicleHazardousPermits: 'F'
            }
        });
        locs.forEach(loc => directionsManager.addWaypoint(new Microsoft.Maps.Directions.Waypoint({ location: loc })));
        directionsManager.calculateDirections();
    });
}

const drawHeatmap = (api, showPins) => {
    Microsoft.Maps.loadModule('Microsoft.Maps.HeatMap', () => {
        const pins = [];
        showPins.forEach(x => {
            // Add X amount of pins per rating
            let n = Math.round(x.show.avg_rating);
            while (n > 0) {
                pins.push(x.pin)
                n--;
            }
        })
        var heatMap = new Microsoft.Maps.HeatMapLayer(pins);
        api.layers.insert(heatMap);
    });
}

const addClustering = (api, pins) => {
    Microsoft.Maps.loadModule("Microsoft.Maps.Clustering", function () {
        //Create a ClusterLayer and add it to the map.
        const clusterLayer = new Microsoft.Maps.ClusterLayer(pins);
        api.layers.insert(clusterLayer);
    });
}

const zoomToShow = (api, show) => {
    api.setView({
        center: new Microsoft.Maps.Location(show.venue.longitude, show.venue.latitude),
        padding: 10,
        zoom: 10
    });
}

const ShowsMap = props => {
    const { shows = [], onShowPinClick, isScriptLoaded, isScriptLoadSucceed, zoomShow } = props;
    const mapRef = useRef();
    const showPins = useRef();
    const [api, setApi] = useState();

    useEffect(() => {
        if (isScriptLoadSucceed && isScriptLoaded && !api) {
            setTimeout(() => setApi(new Microsoft.Maps.Map(mapRef.current)), 1000);
        }
    }, [isScriptLoadSucceed, isScriptLoaded, shows, mapRef, setApi]);

    useEffect(() => {
        if (zoomShow && showPins.current) {
            // Find pin by show id
            const showPin = showPins.current.find(x => x.show.id === zoomShow.id)
            if (showPin) {
                zoomToShow(api, showPin.show);
            }
        }

    }, [showPins, api, zoomShow])

    useEffect(() => {
        if (api) {
            const locs = []
            showPins.current = [];
            shows
                .sort((a, b) => a.date > b.date)
                .filter(x => x.venue.latitude !== null && !isNaN(x.venue.latitude) && !isNaN(x.venue.longitude) && x.venue.longitude !== null)
                .forEach(s => {
                    const { venue = {}, date: rawDate } = s;
                    const date = new Date(rawDate).toLocaleString().split(',')[0].replace(`/${s.year.year}`, '')
                    const title = `${date}: ${venue.name}.  ${venue.location.replace(', USA', '')}`;
                    // return { location: [venue.longitude, venue.latitude], option: { title }, addHandler: { type: 'click', callback: onShowClick } }
                    try {
                        const loc = new Microsoft.Maps.Location(venue.longitude, venue.latitude);
                        var pin = new Microsoft.Maps.Pushpin(loc, {
                            title,
                            color: ratingToColor(s.avg_rating)
                        });
                        if (onShowPinClick && typeof onShowPinClick === 'function') {
                            Microsoft.Maps.Events.addHandler(pin, 'click', () => onShowPinClick(s));
                        }
                        showPins.current.push({ show: s, pin });
                        locs.push(loc);
                    } catch (e) {
                        debugger
                    }

                });

            //Create a LocationRect from array of locations and set the map view.
            if (!zoomShow) {
                api.setView({
                    bounds: Microsoft.Maps.LocationRect.fromLocations(locs),
                    padding: 5 //Add a padding to buffer map to account for pushpin pixel dimensions
                });
            } else {
                zoomToShow(api, zoomShow);
            }

            // Normal
            showPins.current.forEach(x => api.entities.push(x.pin));

            // Clustering
            // addClustering(api, ratedPins.map(x => x.pin));

            // Directions (tour route)
            // drawRoute(api, locs);

            // Heat map
            // drawHeatmap(api, ratedPins);

        }
        //setPushpins(pins)
    }, [api, shows, showPins, zoomShow]);
    return <div id="map" ref={mapRef} style={{ position: 'relative', width: '65vw', height: '600px' }
    }></div >
}

export default scriptLoader(['https://www.bing.com/api/maps/mapcontrol?callback=GetMap&key=AqI_zEfJjaMF7V-i_ns_FP7FNZkPAhRO37IAmF3UjlWpEyathvD6ALF-wOMkHXAj'])(ShowsMap);