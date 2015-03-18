var logger = require("node-config-logger").getLogger("lib/dispatcher.js");
var Promise = require("bluebird");
var path = require("path");
var config = require("config");
var retailerScripts = require("./retailer");
var async = require("async");
var BatchRequest = require("./BatchRequest");
var PhantomInstance = require("./PhantomInstance");
var scrapeTimeout = 45000; // 45 seconds
// map fo phantom instances
var phantomInstances = [];
var nRequests = 0, nFailures = 0, nPending = 0;
var startedTime = new Date();
var moment = require("moment");
var dateTimeTool = require("./util/dateTime");
var tools = require("./util/tools");
var systemMonitor = require("./systemMonitor");
exports.create = function () {
    var promises = [];
    config.ports.forEach(function (port) {
        var instance = new PhantomInstance({
            port: port,
            requestTimeout: scrapeTimeout
        });
        phantomInstances.push(instance);
        promises.push(instance.start());
    });
    return Promise.all(promises);
};


var lastPick = 0;
exports.getAvailablePhantomInstance = function () {
    for (var i = 0; i < phantomInstances.length; i++) {
        var instance = phantomInstances[lastPick++ % phantomInstances.length];
        if (instance.queue.size() === config.maxQueueSize) {
            logger.warn("phantom worker " + instance.id + " queue is full " + instance.queue.size());
        } else if (instance.queue.shuttingDown) {
            logger.warn("phantom worker " + instance.id + " is going to be shutdown , still has " + instance.queue.size() + " jobs left");
        } else {
            return instance.start();
        }
    }
    return Promise.reject("All queues are full");
};

exports.applyToAllPhantomInstances = function (fn) {
    phantomInstances.forEach(function (el) {
        fn(el);
    });
};

/**
 *
 * @param urls can be ["http://www.target.com/store-locator/state-result?stateCode=AL"]
 * @param locale can be us_us
 * @param retailer can be target.com
 * @param type            detail or search
 * @returns {*}
 */
exports.scrape = function (urls, locale, retailer, type) {
    if (!Array.isArray(urls)) {
        urls = [urls];
    }
    if (!urls.length) {
        return Promise.resolve({status: true, message: '', results: []});
    } else {
        nPending++;
        nRequests++;
        return retailerScripts.get(urls, locale, retailer)
            .then(function (newUrls) {
                newUrls.forEach(function (element) {
                    element.method = type;
                });
                if (newUrls.length > 0) {
                    var r = new BatchRequest(newUrls);
                    return r.process(scrapeTimeout).then(function (response) {
                        logger.info("processed " + newUrls.length + " URLs with method " + type + " - status:" + response.status);
                        nPending--;
                        return response;
                    }).catch(function (err) {
                        nFailures++;
                        nPending--;
                        _checkFailureRate();
                        return {
                            status: false,
                            message: err.message || err
                        };
                    });
                } else {
                    nPending--;
                    nFailures++;
                    _checkFailureRate();
                    return {
                        status: false,
                        message: "Nothing to do"
                    };
                }
            })
            .catch(function (e) {
                nPending--;
                nFailures++;
                _checkFailureRate();
                logger.error(e);
                return {
                    "status": false,
                    "message": e.message
                };
            });
    }
};


function _checkFailureRate() {
    if (nFailures / nRequests > config.listener.failureRate.rate && nRequests > config.listener.failureRate.proceed) {
        var msg = "failure rate(dispatcher) higher than " + config.casper.failureRage.rate * 100 + "% , will restart express server";
        logger.warn(msg);
        systemMonitor.restartExpress(msg);
    }
}

exports.restart = function () {
    phantomInstances.forEach(function (instance) {
        instance.stop("restart by parent(express server) manually"); //will restart on demand
    });
};

exports.getStatus = function () {

    return tools.getExternalIp()
        .then(function (add) {
            return Promise.map(phantomInstances, function (el) {
                return systemMonitor.processUsage(el.process.pid)
                    .then(function (usage) {
                        return {
                            id: el.id,
                            pid:el.process.pid,
                            queueSize: el.queue.size(),
                            proceed: el.proceed,
                            failures: el.failures,
                            running: el.running,
                            listening: el.listening,
                            lifetime: dateTimeTool.fromToNow(el.startedTime),
                            "usage": usage
                        };
                    })

            })
                .then(function (instances) {
                    var tmp = {
                        date: new Date(),
                        instanceIp: add,
                        lifetime: dateTimeTool.fromToNow(startedTime),
                        sysMemoryUsage: systemMonitor.getMemoryUsage(),
                        expressUsage:{},
                        requests: {
                            received: nRequests,
                            failures: nFailures,
                            pending: nPending
                        },
                        instances: instances
                    };
                    return tmp;
                })

        })
        .then(function (t) {
            return systemMonitor.processUsage(process.id)
                .then(function (usage) {
                    t.expressUsage = usage;
                    return t;
                })
        })
        .catch(function (err) {
            logger.error(err);
        });
};