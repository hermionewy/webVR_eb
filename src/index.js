import * as d3 from 'd3';
import Menu from './modules/Menu';
import graphic from './modules/graphic';
import loadlink from './modules/loadLink'

import 'bootstrap/dist/css/bootstrap.css';
import './style.css';

//Create instances of all modules (views)
var map, mapViol;
    var zoomLevel = 13.5;
var viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var food = ["Spoilage Unsafe Food", "Cold Holding", "Hot Holding", "Food Utensil Storage", "Food Protection"];
var management = ["PIC knowledge", "PIC Performing Duties", "Consumer Advisories", "Location Accessible"];
var sanitation = ["Separation/Sanitizer Criteria", "Food Contact Surfaces Clean", "Insects Rodents Animals", "Toxic Items"];

    var viewLatLng =[42.3751185, -71.001264];
    if(viewWidth<=768){
        zoomLevel = 13;
        viewLatLng =[42.3630999,-71.0177557];
    }
    map = L.map("map", {
        center:  viewLatLng,
        zoom: zoomLevel,
        scrollWheelZoom: false,
        zoomSnap: 0.5,
        // zoomControl: false,
        // attributionControl: false,
        // doubleClickZoom: false,
        // dragging: false
    });
    mapViol = L.map("map-viol", {
        center: [42.375414, -71.016625],
        zoom: zoomLevel,
        scrollWheelZoom: false,
        zoomSnap: 0.5,
        zoomControl: false,
        attributionControl: false,
        doubleClickZoom: false,
        dragging: false
    });

var opacitytile = 'https://api.mapbox.com/styles/v1/wuyuyanran/cjd3wow5b2spz2sp53m9rcal8/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoid3V5dXlhbnJhbiIsImEiOiJjamN6ODhzczMwb2UyMndxb3lsN3JkZGNwIn0.kBRE1lc7gqCbjF7r2YKhow';
var mapTile = L.tileLayer(opacitytile, {
    id: 'mapbox.opacity',
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var circleGroup = L.featureGroup();
var yelpGroup = L.featureGroup();
var circleGroupViol = L.featureGroup();

    d3.queue()
		.defer(d3.json, './data/eb_neighborhood.geojson')
		.defer(d3.json, './data/eastBostonInspection2.json')
        .defer(d3.json, './processedData/yelpfoodDrinkCoffeeEB.json') //63 restaurants
        // .defer(d3.csv, './data/liquor-licenses.csv', parseLiquor)
		.await(dataloaded);

    function dataloaded(err, geo, data0, yelp) {
		console.log(yelp.length);

        var geoJsonStyle = {
            weight: 1,
            opacity: 1,
            color: 'darkgrey',
            dashArray: '3',
            fillOpacity: 0.05
        };

        var data = data0.filter(function (d) {
            return (d.violStatus== 'Fail') && isLastYear(d.violateDate)
        });


        console.log(data);
        var nestedData = d3.nest().key(function (d) {
            return d.location;
        }).entries(data);

        console.log(nestedData); //161 stores
        
        var restaurantsWithViol = [];
            yelp.forEach(function (yp) {
            yp.violations = [];
            for(var i=0; i<nestedData.length; i++){
                if(nospace_low(nestedData[i].values[0].address) == nospace_low(yp.address) && nospace_low(yp.address)) {
                    yp.violations = nestedData[i].values;
                }
            }
            restaurantsWithViol.push(yp);
        });
        console.log(restaurantsWithViol); //63 stores



        function nospace_low(str) {
            var newStr;
            if(typeof str == "string"){
                newStr = str.replace(/ +/g, "");
                return newStr.toLowerCase();
            }
            return '';
        }

        var nestedByViolation = d3.nest().key(function (d) {
            return d.violDesc;
        }).entries(data);
        console.log(nestedByViolation);  //73 violations

        var geoJson = L.geoJSON(geo, geoJsonStyle);
        geoJson.addTo(map);
        geoJson.addTo(mapViol);


        circleGroup.addTo(map);
        yelpGroup.addTo(map);
        circleGroupViol.addTo(mapViol);
        var bounds = geoJson.getBounds();
        // var overlay = L.imageOverlay('./data/MHIMetroBos.png',bounds, {opacity: 0.5}).addTo(map);


        var info = L.control();

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update();
            return this._div;
        };

// method that we will use to update the control based on feature properties passed
        info.update = function (props) {
            this._div.innerHTML = '<h4>Restaurants</h4>'+ (props ?
                ('<b>' + props.name + '</b><br />Category: ' + props.category + '<br/>'
                + ((props.rating!='undefined')? ('Rating: '+ props.rating +' / ' +props.ratingSignal):''))
                : 'Hover over a circle');
        };

        info.addTo(map);



        restaurantsWithViol.forEach(function (y, id) {
            var circleStyle = {
                fillColor: colorPopular(y.rating),
                //color: colorByNum(obj.values.length),
                stroke: false,
                radius: 50,
                fillOpacity: 0.8,
                className: y.name +'-' +y.category + '-' +y.rating +'-'+ y.ratingSignals
            };
            var circle = L.circle(y.location, circleStyle);
            if(y.violations.length){
                var allV='';
                for(var num = 0; num < y.violations.length; num++){
                    allV = allV.concat(y.violations[num].comments +'<br/>')
                }
                circle.bindPopup(y.name +'<br/>Number of Violations: '+y.violations.length+'<br/>Violations:<br/><div class="viol-scroll">'+allV+'</div>');
            } else{
                circle.bindPopup(y.name +'<br/>No food violations detected.');
            }

            yelpGroup.addLayer(circle);
        });

        yelpGroup.eachLayer(function (layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
            });

        });

        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 6, 7, 8, 9, 10],
                labels = [];

            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + colorPopular(grades[i]+1) + '"></i> ' +
                     (grades[i + 1] ? grades[i] +'&ndash;' + grades[i + 1] + '<br>' : 'No ratings');
            }

            return div;
        };

        legend.addTo(map);

        var legendViol = L.control({position: 'bottomright'});

        legendViol.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 3, 6, 9, 12, 18],
                labels = [];

            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + colorByNum(grades[i]+1) + '"></i> ' +
                    (grades[i + 1] ? grades[i] +'&ndash;' + grades[i + 1] + '<br>' : '18+');
            }

            return div;
        };
        //
        legendViol.addTo(mapViol);

        function highlightFeature(e) {
            var layer = e.target;
            var allInfo = e.target.options.className.split('-');
            var data = {
                    name:allInfo[0],
                    category: allInfo[1],
                    rating: allInfo[2],
                    ratingSignal: allInfo[3]
                };
            layer.setStyle({
                weight: 2,
                stroke: true,
                color: '#666',
                fillColor: layer.options.fillColor,
                fillOpacity: 0.6
            });

            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }

            info.update(data);
        }

        function resetHighlight(e) {
            var layer = e.target;
            layer.setStyle({
                fillColor: layer.options.fillColor,
                stroke: false,
                radius: 50,
                fillOpacity: 0.8
            });
            info.update();
        }


        function colorPopular(num){
            if(num<=6){
                return '#4575b4'
            } else if(num <=7){
                return '#91bfdb'
            } else if(num<=8){
                return '#fee090'
            } else if(num<=9){
                return '#fc8d59'
            } else if (num<=10){
                return '#d73027'
            } else{
                return '#888'
            }
        }

        nestedData.forEach(function (obj) {
            var circleStyle = {
                color: colorByNum(obj.values.length),
                stroke: false,
                radius: 30,
                fillOpacity: 0.7
            };
            var circle = L.circle(obj.values[0].location, circleStyle)
                .bindPopup(obj.values[0].businessName +'<br/>Number of Violations: '+obj.values.length);
            circle.on('mouseover', function (e) {
                this.openPopup();
            });
            circle.on('mouseout', function (e) {
                this.closePopup();
            });
            circleGroupViol.addLayer(circle);
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
        if(num<=3){
            return '#9ac74f'
        } else if(num<=6){
            return '#dac91c'
        } else if(num<=9){
            return '#ffbe42'
        } else if(num<=12){
            return '#ff7f24'
        } else if(num <=15){
            return '#ff0000'
        } else if(num <=18){
            return '#bc0000'
        } else {
            return '#7a0b23'
        }
    }


function isLastYear(str) {
    if(str && str.split('-')[0] == '2017'){
        return true;
    }
    return false
}




