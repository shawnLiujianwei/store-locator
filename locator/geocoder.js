/**
 * Created by Shawn Liu on 2015/3/18.
 */
var countryMap = require("config").countryMap;
var geocoderProvider = 'google';
var httpAdapter = 'https';
//// optionnal
//var extra = {
//    apiKey: 'YOUR_API_KEY', // for Mapquest, OpenCage, Google Premier
//    formatter: null         // 'gpx', 'string', ...
//};

var geocoder = require('node-geocoder').getGeocoder(geocoderProvider, httpAdapter);

//// Or using Promise
////{address:'berhmingham 7146',country:"United States"}
//geocoder.geocode("3150 Bel Air Mall	Mobile, AL36606-3203")
//    .then(function (res) {
//        console.log(res);
//    })
//    .catch(function (err) {
//        console.log(err);
//    });

exports.geo = function (locale, address) {
    var country = countryMap[locale];
    return geocoder.geocode({
        "address": address,
        "country": country
    })
}
