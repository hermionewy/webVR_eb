import * as d3 from 'd3';
import Menu from './modules/Menu';
import graphic from './modules/graphic';
import loadlink from './modules/loadLink'

import 'bootstrap/dist/css/bootstrap.css';
import './style.css';

//Create instances of all modules (views)
var map;
    var zoomLevel = 14;
var viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var viewLatLng =[42.3751185, -71.001264];
    if(viewWidth<=768){
        zoomLevel = 13;
        viewLatLng =[42.3630999,-71.0177557];
    }
    map = L.map("map", {
        center:  viewLatLng,
        zoom: 13.5,
        scrollWheelZoom: false,
        zoomSnap: 0.5,
        // zoomControl: false,
        // attributionControl: false,
        // doubleClickZoom: false,
        // dragging: false
    });


    d3.queue()
		.defer(d3.json, './data/eb_neighborhood.geojson')
		.defer(d3.json, './data/eastBostonInspection2.json')
        .defer(d3.json, './processedData/yelpAllEast.json')
        // .defer(d3.csv, './data/liquor-licenses.csv', parseLiquor)
		.await(dataloaded);

    function dataloaded(err, geo, data, yelp) {
		// console.log(data);
		// console.log(geo);
		console.log(yelp.length);

        var geoJsonStyle = {
            weight: 1,
            opacity: 1,
            color: 'darkgrey',
            dashArray: '3',
            fillOpacity: 0.05
        };


        var nestedData = d3.nest().key(function (d) {
            return d.location;
        }).entries(data);

        console.log(nestedData);

        var nestedByViolation = d3.nest().key(function (d) {
            return d.violDesc;
        }).entries(data);
        console.log(nestedByViolation);

        var geoJson = L.geoJSON(geo, geoJsonStyle);
        geoJson.addTo(map);

        var circleGroup = L.featureGroup();
        var yelpGroup = L.featureGroup();
        var liquorGroup = L.featureGroup();
        circleGroup.addTo(map);
        yelpGroup.addTo(map);
        liquorGroup.addTo(map);
        var bounds = geoJson.getBounds();
        var overlay = L.imageOverlay('./data/MHIMetroBos.png',bounds, {opacity: 0.5}).addTo(map);


        // liquor.forEach(function (d) {
        //         var circleStyle = {
        //             color: 'black',
        //             radius: 50,
        //             fillOpacity: 0
        //         };
        //         var circle = L.circle([d.lat, d.lng], circleStyle).bindPopup(d.name);
        //     liquorGroup.addLayer(circle);
        // });




        // yelp.forEach(function (y) {
        //     var circleStyle = {
        //         color: 'steelblue',
        //         //color: colorByNum(obj.values.length),
        //         stroke: false,
        //         radius: 20,
        //         fillOpacity: 0.7
        //     };
        //     var circle = L.circle(y.location, circleStyle).bindPopup(y.name +'<br/>'+y.rating);
        //     yelpGroup.addLayer(circle);
        // });

        nestedData.forEach(function (obj) {
            var circleStyle = {
                color: colorByNum(obj.values.length),
                stroke: false,
                radius: 20,
                fillOpacity: 0.7
            };
            var circle = L.circle(obj.values[0].location, circleStyle).bindPopup(obj.values[0].businessName +'<br/>'+obj.values.length);
            circleGroup.addLayer(circle);
        });

    }

    function parseLiquor(d) {
        return {
            'name': d['BUSINESSNAME'],
            'zip': d['ZIP'],
            'address': d['Address'],
            'lat': +(d['Location'].split(',')[0].split('(')[1]),
            'lng': +(d['Location'].split(',')[1].split(')')[0]),
        }
    }
    function colorByNum(num) {
        if(num<20){
            return '#29dc2f'
        } else if(num<40){
            return '#9ac74f'
        } else if(num<60){
            return '#dac91c'
        } else if(num<80){
            return '#ffbe42'
        } else if(num<100){
            return '#ff7f24'
        } else if(num <120){
            return '#ff0000'
        } else if(num < 140){
            return '#bc0000'
        } else {
            return '#7a0b23'
        }
    }







