const request = require('request');
const d3 = require('d3');

d3.json('http://localhost:9000/data/eastBostonInspection2.json', function (err, data) {
    // console.log(data.length);
    var nestedData = d3.nest().key(function (d) {
        return d.location;
    }).entries(data);
    var yelp = [];
    //nestedData.forEach(function (obj) {
        var obj = nestedData[0];
        var lat = obj.values[0].location[0],
            lng = obj.values[0].location[1],
            name = obj.values[0].businessName;
        var location = lat.toString()+', '+ lng.toString();
        console.log(location);
        console.log(name);
        request({
            url: 'https://api.foursquare.com/v2/venues/search',
            method: 'GET',
            qs: {
                client_id: 'YCZIS42FBKRPLLNPHRW5NHE5WWZHEYCZLHMI5WT1W3H5DRZQ',
                client_secret: 'G5CBIWSSMKVWMOFHQML2Q4SO2PSBMZ00CCZLR55GOUB42LIP',
                ll: location,
                name: name,
                near: 'Boston, MA',
                intent: 'match',
                zip: '02128',
                city: 'Boston',
                State:'MA',
                v: '20170801',
            }
        }, function(err, res, body) {
            if (err) {
                console.error(err);
            } else {
                // if(body.response.venues.length!= 0)
                console.log(body);
                console.log(body);
                yelp.push(body);
            }
        });

    //});
    console.log(yelp.length);

});


