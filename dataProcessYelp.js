const d3 = require('d3');

d3.queue()
    //.defer(d3.json, "http://localhost:9000/yelp/yelpBar.json")
    .defer(d3.json, "http://localhost:9000/yelp/yelpNearEB.json")
    .await(function(err, data) {
        console.log(data);
        console.log(data.response.venues.length);
        console.log(data.response.venues[0]);
        //console.log(data.response.groups.items.length);
                var restaurants = data.response.venues;
                var newData = restaurants.map(function (obj) {
                    return {
                        'name': obj.venue.name,
                        'location': [obj.venue.location.lat, obj.venue.location.lng],
                        'category': (obj.venue.categories.length)?obj.venue.categories[0].name: 'none',
                        'checkinCount': obj.venue.stats.checkinsCount,
                        'userCount': obj.venue.stats.usersCount,
                        'tipCount': obj.venue.stats.tipCount,
                        'address': obj.venue.location.address,
                        'url': obj.venue.url,
                        'rating': obj.venue.rating,
                        'ratingColor':obj.venue.ratingColor,
                        'ratingSignals': obj.venue.ratingSignals,
                        'zip': obj.venue.location.postalCode,
                    }
                });

                console.log(newData.length);
                console.log(newData[0]);


        // const masterData = data.filter(function (d) {
        //     var year = ["2017", "2016", "2015", '2014', '2013'];
        //
        //    return d['CITY'] == 'East Boston' && (year.indexOf(d['VIOLDTTM'].split(' ')[0].split('-')[0])!=-1);
        // });

        // var parsedData = masterData.map(function (t) {
        //     return {
        //
        //     }
        // });
        // console.log(parsedData[0]);




        writeJsonFile(newData, "dist/processedData/yelpNearEB.json", () => {
           console.log('err');
    });
    });


const fs = require("file-system");
function writeJsonFile(data, filename, callback) {
    fs.writeFile(filename, JSON.stringify(data), function(err){
        if(err) throw err;
        callback();
    });
}