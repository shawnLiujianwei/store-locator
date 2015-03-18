/**
 * Created by Shawn Liu on 2015/3/18.
 */

//var obj = {
//    "locale": "fr_fr",
//    "retailer": "test.com",
//    "address": {
//        latitude: 48.8698679,
//        longitude: 2.3072976,
//        country: 'France',
//        countryCode: 'FR',
//        city: 'Paris',
//        zipcode: '75008',
//        streetName: 'Champs-Élysées',
//        streetNumber: '29',
//        state: 'Île de France',
//        stateCode: 'IDF'
//    },
//    "summary": {
//        "name": "",
//        "address": "",
//        "phone": "",
//        "openTimes": [""]
//    }
//}

var logger = require("node-config-logger").getLogger("locator/store.js");
function Store(locale, retailer, geoObj, summary) {

    this.locale = locale;
    this.retailer = retailer;
    this.address = geoObj;
    this.summary = summary;
    //this.fill(json);
}

var geo = require("./geocoder");
var Promise = require("bluebird");
var retryTimes = 3;
exports.generate = function (locale, retailer, summary) {
    return geo.geo(locale, summary.address)
        .then(function (list) {
            if (list && list.length > 0) {
                return new Store(locale, retailer, list[0], summary);
            } else {
                return Promise.reject("Failed to get lat&lng for address:" + summary.address);
            }
        })
        .catch(function (err) {
            if (retryTimes > 0) {
                retryTimes--;
                logger.warn("Failed to geo the address,will retry");
                return exports.generate(locale, retailer, summary);
            } else {
                logger.warn("Failed to geo address and meet the max retry times");
                return new Store(locale, retailer, {}, summary);
            }

        });
}