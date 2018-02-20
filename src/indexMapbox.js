import * as d3 from 'd3';

import dataloader from './modules/dataloader';
import Menu from './modules/Menu';
import graphic from './modules/graphic';
import loadlink from './modules/loadLink'

import 'bootstrap/dist/css/bootstrap.css';
import './style.css';

//Create instances of all modules (views)
//Not needed for Dataloader, since an instance has already been exported
// const menu = Menu();
const globalDispatch = d3.dispatch('search');

mapboxgl.accessToken = 'pk.eyJ1Ijoid3V5dXlhbnJhbiIsImEiOiJjamN6ODhzczMwb2UyMndxb3lsN3JkZGNwIn0.kBRE1lc7gqCbjF7r2YKhow';
var map = new mapboxgl.Map({
    style: 'mapbox://styles/mapbox/satellite-v9',
    center: [-71.011264, 42.3731185],
    zoom: 13,
    pitch: 45,
    bearing: -17.6,
    // hash: true,
    container: 'map'
});

    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', function() {
        // Add the circle layer to the map
        map.addLayer({
            id: 'yelp',
            type: 'circle',
            source: {
                type: 'vector',
                url: 'mapbox://mapbox.dvrdhs7l' // Your Mapbox tileset Map ID
            },
            'source-layer': 'Signalized_Intersection_Traff-4ypaqa' // name of tilesets
        });
    });



    d3.queue()
		.defer(d3.json, './data/bos_neighborhoods.json')
		.defer(d3.csv, './data/EastBoston311.csv', parseCSV)
		.await(dataloaded);

    function dataloaded(err, geo, data) {
		console.log(data);


    }

	function parseCSV(d) {
    	//2017-08-11T14:06:00
		return {
			openDate: d['open_dt'],

		}
    }






dataloader
	.on('dataloaded',function(data){
		//Once dataloaded, populate modules
		// d3.select('.navbar').datum(data).call(menu); //menu module
		// d3.select('.plot').datum(data).call(graphic); //graphic module --> force layout
	});

