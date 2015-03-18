/**
 * Created by Shawn Liu on 2015/3/18.
 */
var dispatcher = require("../lib/dispatcher");
var logger = require("node-config-logger").getLogger("locator/index.js");
var locatorMap = require("config").locatorMap;
var Promise = require("bluebird");
var ErrorHandler = require("../errors");
var storeService = require("./stores");
var locatorService = require("./locator.service");
var async = require("async");
var _ = require("lodash");
exports.searchFromDB = function (req, res) {
    var locale = req.params.locale;
    var retailer = req.params.retailer;
    locatorService.search({
        "locale": locale,
        "retailer": retailer
    })
        .then(function (list) {
            res.json(list);
        })
        .catch(function (err) {
            ErrorHandler[500](req, res, err.message || err);
        })
}
exports.searchFromSite = function (req, res) {
    var locale = req.params.locale;
    var retailer = req.params.retailer;
    var postData = req.body;
    if (postData) {
        if (postData.zipcode) {
            //method = search
            if (locatorMap[locale] && locatorMap[locale][retailer]) {
                var searchUrl = locatorMap[locale][retailer].searchUrl;
                return dispatcher.scrape(searchUrl, locale, retailer, "search")
                    .then(function (t) {
                        return _handleScrapedResults(locale, retailer, t);
                    })
                    .then(function (list) {
                        res.json(list);
                    })
                    .catch(function (err) {
                        ErrorHandler[500](req, res, err.message || err);
                    })
            } else {
                ErrorHandler[400](req, res, "There is no configuration for '" + locale + "-" + retailer + "'");
            }

        } else if (postData.url) {
            //method = detail
            dispatcher.scrape(postData.url, locale, retailer, "list")
                .then(function (t) {
                    return _handleScrapedResults(locale, retailer, t);
                })
                .then(function (list) {
                    res.json(list);
                })
                .catch(function (err) {
                    ErrorHandler[500](req, res, err.message || err);
                })
        } else {
            ErrorHandler[400](req, res, "need post zipcode or url");
        }
    } else {
        ErrorHandler[400](req, res, "missed post data section");
    }
}

var cronJob = require('cron').CronJob;
var jobConfig = require("config").background;
exports.startBackgroundJob = function () {

    if (jobConfig.enable) {
        logger.info("setup cron job '" + jobConfig.job + "'");
        new cronJob({
            cronTime: jobConfig.job,
            onTick: function () {
                logger.info("run cron job");
                _setupCronJob()
                    .then(function () {
                        logger.info("background job finished");
                    })
                    .catch(function (err) {
                        logger.error("background job occured issue: ", err);
                    })
            },
            start: true
        });
    } else {
        logger.info("background job is disabled");
    }
}

function _setupCronJob() {
    return new Promise(function (resolve, reject) {
        var jobs = [];
        Object.keys(locatorMap).forEach(function (locale) {
            Object.keys(locatorMap[locale]).forEach(function (retailer) {
                if (locatorMap[locale][retailer].valid) {
                    locatorMap[locale][retailer].urls.forEach(function (url) {
                        jobs.push({
                            "locale": locale,
                            "retailer": retailer,
                            "url": url
                        })
                    })
                }
            });
        });
        jobs = _.shuffle(jobs);
        async.until(function isDone() {
            return jobs.length === 0;
        }, function next(callback) {
            var job = jobs.shift();
            dispatcher.scrape(job.url, job.locale, job.retailer, "list")
                .then(function (t) {
                    return _handleScrapedResults(job.locale, job.retailer, t);
                })
                .catch(function (err) {
                    logger.error(err);
                })
                .finally(callback);
        }, function done() {
            resolve();
        })
    })

}
//var scrpedResults = {
//    "status": true,
//    "results": [
//        {
//            "status": false,
//            "name": "",
//            "url": "",
//            "phone": "",
//            "address": "",
//            "openTimes": []
//        }
//    ]
//}
var _handleScrapedResults = function (locale, retailer, scraedResults) {
    return new Promise(function (resolve, reject) {
        var promise = Promise.resolve();
        if (scraedResults && scraedResults.status) {
            promise.then(function () {
                //return Promise.resolve(scraedResults.results);
                var storeList = scraedResults.results;
                storeList = storeList.filter(function (t) {
                    return t.status;
                });
                return Promise.map(storeList, function (summary) {
                    return storeService.generate(locale, retailer, summary)
                        .then(function (store) {
                            return locatorService.upsert(store)
                                .then(function () {
                                    return store;
                                });
                        })
                })
                    .then(function (all) {
                        resolve(all);
                    })
                    .catch(function (err) {
                        logger.error(err);
                        resolve([]);
                    })
            })

        } else {
            return Promise.reject(scraedResults.message);
        }
    })

}