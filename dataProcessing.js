const d3 = require('d3');

d3.queue()
    .defer(d3.csv, "http://localhost:9000/data/mayorsfoodcourt.csv")
    .await(function(err, data) {
        console.log(data.length);

        const masterData = data.filter(function (d) {
            var year = ["2017", "2016", "2015", '2014', '2013'];

           return d['CITY'] == 'East Boston' && (year.indexOf(d['VIOLDTTM'].split(' ')[0].split('-')[0])!=-1);
        });

        var parsedData = masterData.map(function (t) {
            return {
                businessName: t['businessName'],
                legalOwner: t['LegalOwner'],
                licenseNo: t['LICENSENO'],
                startDate: parseDate(t['ISSDTTM']),
                violateDate: parseDate(t['VIOLDTTM']),
                resultDate: parseDate(t['RESULTDTTM']),
                violDesc: t['ViolDesc'],
                violStatus: t['ViolStatus'],
                comments: t['Comments'],
                address: t['Address'],
                city: t['CITY'],
                zip: t['ZIP'],
                location: getLocation(t['Location'])
            }
        });
        console.log(parsedData[0]);

        function parseDate(str) {
            //2013-02-15 12:19:42
            if(str){
                var y = +(str.split(' ')[0].split('-')[0]),
                    m = +(str.split(' ')[0].split('-')[1]),
                    d = +(str.split(' ')[0].split('-')[2]),
                    h = +(str.split(' ')[1].split(':')[0]),
                    min = +(str.split(' ')[1].split(':')[1]),
                    s = +(str.split(' ')[1].split(':')[2]);

                return new Date(y,m,d,h,min,s);
            }
            return new Date(1900,0,1,0,0,0);
        }

        function getLocation(str) {
            if(str){
                var lat = +(str.split(',')[0].split('(')[1]);
                var lng = +(str.split(',')[1].split(')')[0]);
                return [lat, lng];
            }
            return [0, 0];
        }
        console.log(parsedData.length);

        writeJsonFile(parsedData, "dist/processedData/eastBostonInspection2.json", () => {
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