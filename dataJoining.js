const d3 = require('d3');

d3.queue()
    .defer(d3.csv, "http://localhost:9000/data/allFood.csv")
    .defer(d3.json, "http://localhost:9000/data/eastBostonInspection2.json")
    .await(function(err, store, data0) {


        console.log(store.length);
        console.log(data0.length);

        var data = data0.filter(function (t) {
            return isLastYear(t.violateDate)
        });

        var nestedData = d3.nest().key(function (d) {
            return d.location;
        }).entries(data);

        var newLatlngs = [];
        nestedData.forEach(function (t) {
            newLatlngs.push(t.values[0].location);
        });

        console.log(newLatlngs.length);
        //console.log(newLatlngs);


        var newarr=[];
        for(var i=0; i<store.length; i++){
            //console.log(getLocation(store[i].Location));
                if( searchForArray(newLatlngs, getLocation(store[i].Location)) == -1 ){
                    newarr.push(store[i]);
                }

        }
        console.log(newarr);

        var parsedArray = newarr.map(function (t) {
            return {
                name: t.businessName,
                address: t["Address"],
                desc: t['DESCRIPT'],
                location: getLocation(t['Location']),
            }
        });
        console.log(parsedArray);

        function searchForArray(haystack, needle){
            var i, j, current;
            for(i = 0; i < haystack.length; ++i){
                if(needle.length === haystack[i].length){
                    current = haystack[i];
                    for(j = 0; j < needle.length && needle[j] === current[j]; ++j);
                    if(j === needle.length)
                        return i;
                }
            }
            return -1;
        }

        function arraysEqual(a1,a2) {
            /* WARNING: arrays must not contain {objects} or behavior may be undefined */
            return JSON.stringify(a1)==JSON.stringify(a2);
        }
        const masterData = data.filter(function (d) {
            var year = ["2017", "2016", "2015", '2014', '2013'];

           return d['CITY'] == 'East Boston' && (year.indexOf(d['VIOLDTTM'].split(' ')[0].split('-')[0])!=-1);
        });



        function getLocation(str) {
            if(str){
                var lat = +(str.split(',')[0].split('(')[1]);
                var lng = +(str.split(',')[1].split(')')[0]);
                return [lat, lng];
            }
            return [0, 0];
        }
        function isLastYear(str) {
            if(str && str.split('-')[0] == '2017'){
                return true;
            }
            return false
        }


        writeJsonFile(parsedArray, "dist/processedData/parsedSafeStores.json", () => {
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