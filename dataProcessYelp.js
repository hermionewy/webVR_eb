const d3 = require('d3');

d3.queue()
    .defer(d3.json, "http://localhost:9000/yelp/EBosYelpFoodSection.json")
    .defer(d3.json, "http://localhost:9000/yelp/EBosYelpDrinkSection.json")
    .defer(d3.json, "http://localhost:9000/yelp/EBosYelpCoffeeSection.json")
    .await(function(err, food, drink, coffee) {

        console.log(food.response.groups[0].items.length);
        console.log(drink.response.groups[0].items.length);
        console.log(coffee.response.groups[0].items.length);

        var allVenue = food.response.groups[0].items.concat(drink.response.groups[0].items, coffee.response.groups[0].items)
        console.log(allVenue.length);

        var ebVenue = allVenue.filter(function (d) {
            return d.venue.location.postalCode == '02128'
        });
        console.log(ebVenue.length);
        console.log(ebVenue[0]);

        // console.log(filteredData.length);
                var newData = ebVenue.map(function (d) {
                    var obj = d.venue;
                    return {
                        'name': obj.name,
                        'location': [+obj.location.lat, +obj.location.lng],
                        'category': (obj.categories.length)?obj.categories[0].name: 'none',
                        'checkinCount': obj.stats.checkinsCount,
                        'userCount': obj.stats.usersCount,
                        'tipCount': obj.stats.tipCount,
                        'address': obj.location.address,
                        'url': obj.url,
                        'rating': obj.rating,
                        'ratingColor':"#"+obj.ratingColor,
                        'ratingSignals': obj.ratingSignals,
                        'zip': obj.location.postalCode,
                        'comment': getTips(d.tips)
                    }
                });

                function getTips(arr) {
                    var alltip = [];
                    if(arr && arr.length){
                        arr.forEach(function (t) {
                            alltip.push({
                                'text': t.text,
                                'user': t.user.lastName? (t.user.firstName+' '+ t.user.lastName): t.user.firstName
                            })
                        })
                    }
                    return alltip;
                }

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




        writeJsonFile(newData, "dist/processedData/yelpfoodDrinkCoffeeEB.json", () => {
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