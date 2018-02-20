const d3 = require('d3');

d3.queue()
    .defer(d3.json, "http://localhost:9000/processedData/yelpCoffee.json")
    .defer(d3.json, "http://localhost:9000/processedData/yelpBar.json")
    .defer(d3.json, "http://localhost:9000/processedData/yelpFood.json")
    .await(function(err, data0, data1, data2) {
        var newData = data0.concat(data1, data2).filter(function (t) {
            return t.zip == '02128'
        });




        writeJsonFile(newData, "dist/processedData/yelpAllEast.json", () => {
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