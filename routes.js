var Promise = require("bluebird");
var logger = require("node-config-logger").getLogger("routes.js");
var dispatcher = require("./lib/dispatcher");
var retailerScripts = require("./lib/retailer");
var port = require("config").listener.port;
var monitor = require("./lib/systemMonitor");
var serverStatus = require("./lib/instanceStatus");
exports.load = function (app, express) {
//

    app.route("/ping").get(function (req, res, next) {
        res.json({
            "message": "pong",
            "date": new Date()
        })
    });

    app.route('/status').get(function (req, res, next) {
        dispatcher.getStatus()
            .then(function (t) {
                res.json(t);
            })
            .catch(function (err) {
                res.json({
                    "error": true,
                    "message": err.message || err
                });
            });
    });

    app.route("/restart").post(function (req, res) {
        res.json({
            "message": "Express server has been restarted(testing)."
        });
    });

    app.route("/server/restart").post(function (req, res) {
        logger.warn("Will restart express server.");
        res.json({
            "message": "Express server has been restarted(testing)."
        });
        monitor.restartExpress();
    });

    app.route("/server/logs/type/:type/id/:id").delete(function (req, res) {
        serverStatus.deleteLog(req.params.type, req.params.id)
            .then(function (r) {
                res.json(r);
            })
            .catch(function (err) {
                res.json({
                    "error": true,
                    "message": err.message || err
                });
            });
    });

    app.route("/server/logs/type/:type").delete(function (req, res) {
        serverStatus.deleteLog(req.params.type, req.params.id)
            .then(function (r) {
                res.json(r);
            })
            .catch(function (err) {
                res.json({
                    "error": true,
                    "message": err.message || err
                });
            });
    });

    app.route("/server/logs/type/:type").get(function (req, res) {
        serverStatus.getLogs(req.params.type)
            .then(function (s) {
                res.json(s);
            })
            .catch(function (e) {
                res.json({
                    "error": true,
                    "message": e.message || e
                });
            });
    });
    app.route("/server/logs/type/:type/ip/:ip").get(function (req, res) {
        serverStatus.getLogs(req.params.type, {"ip": req.params.ip})
            .then(function (s) {
                res.json(s);
            })
            .catch(function (e) {
                res.json({
                    "error": true,
                    "message": e.message || e
                });
            });
    });

    app.route('/retailers/:locale').get(function (req, res, next) {
        var locale = req.params.locale;
        if (!locale) {
            locale = "en_gb";
        }
        retailerScripts.all(locale).then(function (scripts) {
            res.json(scripts);
        }).catch(function (response) {
            res.json({
                "error": true,
                "message": response.message || response
            });
        });
    });

    var storeLocator = require("./locator");
    app.route('/locator/locale/:locale/retailer/:retailer').get(storeLocator.searchFromDB);

    //will scrape store locations from site real-time
    //var postData = {
    //    "zipcode":"35007",
    //    "searchUrl":""
    //}
    //or

    //var postData = {
    //    "url":"http://www.target.com/store-locator/state-result?stateCode=AL"
    //}
    app.route('/locator/locale/:locale/retailer/:retailer').post(storeLocator.searchFromSite);


};


