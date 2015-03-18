var Text = require("../../util/textFormat");


// all function should return

//var json = {
//    "status":false or true,
//    "results":
//        [
//            {
//                "status":true or false,
//                "name":"",
//                "url":"",
//                "phone":"",
//                "address":"",
//                "openTimes":[]
//            }
//        ]
//}
//scrape by urls that can get store list
//normally it's store list page or store detail page
exports.fetch = function (casper, timeout, callback) {
    var json = {
        "status": false
    };
    casper.waitUntilVisible("#stateresultstable", function () {
        var list = casper.getElementsAttribute("#stateresultstable table td.data-row a", "href");
        if (list && list.length > 0) {
            for (var i = 0; i < list.length; i++) {
                list[i] = "http://www.target.com" + list[i];
            }
            _eachLinks(list, casper, timeout, function (results) {
                json.status = true;
                json.results = results;
                callback(json)
            })
            //json.status = true;
            //json.results = list;
            //callback(json);
        } else {
            json.message = "Didn't find any store";
            callback(json);
        }
    }, function onTimeout() {
        json.message = "wait timeout for selector '#stateresultstable'";
        callback(json);
    }, timeout);
};

//search stores by zipcode
exports.search = function (casper, timeout, callback) {
    var json = {
        "status": false
    };
    casper.waitUntilVisible("", function () {

    }, function onTimeout() {
        json.message = "wait timeout for selector ''";
        callback(json);
    }, timeout);
};

function _eachLinks(links, casper, timeout, callback) {
    var results = [];
    casper.eachThen(links, function (link) {
        casper.thenOpen(link.data, function (response) {
            if (response.status === 200) {
                _detail(casper, timeout, function (list) {
                    results = results.concat(list);
                });
            } else {
                var json = {
                    "status": false,
                    "url": link
                };
                json.code = response.status;
                results.push(json);
            }
        })
    });
    casper.then(function () {
        callback(results);
    })
}

function _detail(casper, timeout, callback) {
    var json = {
        "status": false,
        //"name": "",
        "url": casper.getCurrentUrl()//,
        //"phone": "",
        //"address": "",
        //"openTimes": []
    }
    casper.waitUntilVisible("#Content", function () {
        json.status = true;
        json.name = Text.format(casper.fetchText("#Content > span > div.heading > h1"));
        json.address = Text.format(casper.fetchText("#storeInfo > p:nth-child(1)"));
        json.phone = Text.format(casper.fetchText("#storeInfo > p:nth-child(2) > span:nth-child(2)"));
        var open = casper.getElementsAttribute("#storeInfo > div.timesopn time", "datetime");
        json.openTimes = open;
        callback(json);
    }, function onTimeout() {
        json.message = "wait timeout for selector '#Content'"
    }, timeout);
}