const request = require('request');

request({
    url: 'https://api.foursquare.com/v2/venues/explore',
    method: 'GET',
    qs: {
        client_id: 'YCZIS42FBKRPLLNPHRW5NHE5WWZHEYCZLHMI5WT1W3H5DRZQ',
        client_secret: 'G5CBIWSSMKVWMOFHQML2Q4SO2PSBMZ00CCZLR55GOUB42LIP',
        intent: 'browse',
        //ll: '42.3731185,-71.051264',
        //radius: 5000,
        near: 'East Boston, Boston, MA 02128',
        //categoryId:'4d4b7105d754a06374d81259',
        // categoryId:'4d4b7105d754a06376d81259',
        section:'coffee',
        //categories:["4d4b7105d754a06374d81259"],
        time: 'any',
        day: 'any',
        openNow: 0,
        v: '20170801',
        limit: 500,
    }
}, function(err, res, body) {
    if (err) {
        console.error(err);
    } else {
        console.log(body);
    }
});