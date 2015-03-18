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
    casper.waitUntilVisible("body > div.page-wrapper.js-page-wrapper > section > section.center > div.js-sf-outer.sf-outer.fullwidth > div.container-responsive > div.js-sf-results.sf-modal.sf-results > div.js-store-finder-list.store-finder-list.active > ol", function () {
        var list = casper.getElementsAttribute("body > div.page-wrapper.js-page-wrapper > section > section.center > div.js-sf-outer.sf-outer.fullwidth > div.container-responsive > div.js-sf-results.sf-modal.sf-results > div.js-store-finder-list.store-finder-list.active > ol a.hide-content-store-breakpoint", "href");
        if (list && list.length > 0) {
            for (var i = 0; i < list.length; i++) {
                list[i] = "http://www.walmart.com" + list[i];
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
        json.message = "wait timeout for selector 'body > div.page-wrapper.js-page-wrapper > section > section.center > div.js-sf-outer.sf-outer.fullwidth > div.container-responsive > div.js-sf-results.sf-modal.sf-results > div.js-store-finder-list.store-finder-list.active > ol'";
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
    casper.waitUntilVisible("ul.wn-location-info-list", function () {
        json.status = true;

        var tmp = casper.evaluate(function () {
            var nodes = document.querySelectorAll("ul.wn-location-info-list li");
            var t = {
                "name": "",
                "address": "",
                "phone": ""
            };
            if (nodes) {
                t.name = nodes[0].innerText;
                if (nodes.length > 2) {
                    t.phone = nodes[nodes.length - 2].innerText;
                    for (var i = 1; i < nodes.length - 2; i++) {
                        t.address += nodes[i].innerText;
                    }
                }
            }

            return t;
        });
        tmp = tmp || {};
        json.name = tmp.name;
        json.address = tmp.address;
        json.phone = tmp.phone;
        var open = casper.getElementsAttribute("div.wn-store-hours ul meta", "content");
        json.openTimes = open;
        callback(json);
    }, function onTimeout() {
        json.message = "wait timeout for selector 'ul.wn-location-info-list'"
    }, timeout);
}