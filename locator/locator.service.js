/**
 * Created by Shawn Liu on 2015/3/18.
 */
var logger = require("node-config-logger").getLogger("locator/locator.service.js");
var config = require("config");
var Promise = require("bluebird");
var db = require('mongo-bluebird').create(config.scrapecache.db);
var collection = db.collection("stores")
exports.search = function (query) {
    var filter = _getFilter(query);
    return collection.find(filter);
}

exports.upsert = function (store) {
    if (store.summary.time) {
        store.updateDate = store.summary.time;
        delete store.summary.time;
    }
    delete store.summary.status;
    return collection.upsert({
        "locale": store.locale,
        "retailer": store.retailer,
        "summary.name": store.summary.name
    }, store);
}

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
function _getFilter(filter) {
    var query = {};
    if (filter.locale) {
        query.locale = filter.locale;
    }
    if (filter.retailer) {
        query.retailer = filter.retailer;
    }
    if (filter.zipcode || filter.state || filter.stateCode || filter.city) {
        query.address = {};
        if (filter.zipcode) {
            query.address.zipcode = filter.zipcode;
        }
        if (filter.state) {
            query.address.state = filter.state;
        }
        if (filter.stateCode) {
            query.address.stateCode = filter.stateCode;
        }
        if (filter.city) {
            query.address.city = filter.city;
        }
    }
    return query;
}