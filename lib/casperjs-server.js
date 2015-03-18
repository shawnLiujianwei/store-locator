var system = require("system");
var Logger = require('./util/casperLogger');
var logger = new Logger(system.env.CASPER_LOG_FILE || './casper.log');

var casper = require('casper').create({
    viewportSize: {width: 1366, height: 768},
    pageSettings: {
        userAgent: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.149 Safari/537.36",
        loadImages: true,
        loadPlugins: false,
        resourceTimeout: 10000
    },
    verbose: true,
    logLevel: system.env.CASPER_LOG_LEVEL ? system.env.CASPER_LOG_LEVEL.toLowerCase() : 'debug'
});

var config = {"port": system.args[system.args.length - 1]};
var server = require('webserver').create();
//var casper = require('casper').create();
//casper.userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.149 Safari/537.36');
phantom.addCookie({
    'name': 'referencedPos',
    'value': 1077,
    'domain': 'www.lagranderecre.fr'
});
casper.start();
var timeout = 5000;
var status = server.listen(config.port, function (request, response) {
    casper.on('remote.message', function (msg) {
        logger.info('<REMOTE MESSAGE> ' + msg);
    });
    casper.then(function () {
        //var method = request.method;
        if (request.url === '/scrape') {
            var postData = request.post;
            postData = this.evaluate(function (s) {
                return JSON.parse(s);
            }, postData);

            if (postData) {
                _process(postData, response);
            } else {
                _finish({
                    "status": false,
                    "message": "There is no urls to be updated."
                }, response);
            }
        } else if (request.url === '/exit') {
            logger.info("Casper server suicide");
            _output("server is stopping.", response);
            server.close();
            casper.exit();
        } else {
            logger.info("Other url received: " + request.url);
            _output("server is running.", response);
        }
    });
    casper.on("exit", function (code) {
        logger.info("Casper server exit: " + code);
        //casper.log("Casper server exit:" + msg, "error");
    });
    casper.on("error", function (msg) {
        logger.error("Casper server error: ", msg);
        //casper.log(msg, "error");
    });

    casper.on("log", function (msg) {
        if (msg) {
            logger.info(msg.message);
        }
    });

    casper.on("resource.error", function (resourceError) {
        //only write log into casper log file , for the log that need to send back to node process. see below
        logger.error("Resource error:" + JSON.stringify(resourceError));

        // here change the log lever of resource.error from error to debug
        // due many these log are occoure like 'Operation canceled' , etc,  normally these kind of error won't cause two terrible issue
        // so in the production we don't want them to be inserted into log file .
        // in dev eviroment we will use level debug ,there information will come out.
        casper.log("Resource error:" + JSON.stringify(resourceError), "debug");

    });
    casper.run(function () {
        logger.info("Casper listening on port " + config.port);
        //casper.log("Casper listening on port " + config.port, "info");
    });
});

if (!status) {
    logger.info("Failed to listen on port " + config.port);
    casper.exit(1);
}

function _process(job, res) {
    var products = [];
    var url = job.url;
    var method = job.method;
    var retailerFile = job.retailerFile;
    var json = {
        status: false,
        url: url,
        updateTime: new Date().toUTCString(),
        script: retailerFile
    };
    var script = require(retailerFile);
    if (script) {

        // allow script to make changes to the url prior to opening
        if (script.redirect) {
            url = script.redirect(url);
            json.actualURL = url;
        }
        casper.thenOpen(url, function onResponse(response) {

            json.code = response.status;
            switch (response.status) {
                case 200 :
                    try {
                        //var res = {
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
                        if (method === "list") {
                            //details(script, timeout, json, function(products){
                            //    _finish(json, res);
                            //});
                            script.fetch(casper, timeout, function (res) {
                                json.status = res.status;
                                json.message = res.message;
                                json.results = res.results;
                                _finish(json, res);
                            });
                        } else if (method === 'search') {
                            script.fetch(casper, timeout, function (res) {
                                json.status = res.status;
                                json.message = res.message;
                                json.results = res.results;
                                _finish(json, res);
                            });
                        } else {
                            json.message = "unknown method " + method;
                            _finish(json, res);
                        }

                    } catch (e) {
                        json.message = e.message;
                        _finish(json, res);
                    }
                    break;
                case 404:
                    json.status = false;
                    _finish(json, res);
                    break;
                case 410:
                    json.status = false;
                    _finish(json, res);
                    break;
                default:
                    json.status = false;
                    json.message = "Failed to access retailer site " + url + " - "
                    + (response ? JSON.stringify(response) : "");
                    _finish(json, res);
            }

        }, function onTimeout() {
            json.message = "Timeout opening " + url;
            json.status = false;
            _finish(json, res);
        }, timeout);

    } else {
        json.message = retailerFile + " not found";
        json.status = false;
        _finish(json, res);
    }


    //casper.then(function () {
    //    casper.log("--------------------------------", "error");
    //    casper.log(JSON.stringify(products), "info")
    //    casper.log("--------------------------------", "error");
    //    outputJson.status = true;
    //    outputJson.results = products;
    //    _finish(outputJson, res);
    //});

    casper.on("error", function (msg, backtrace) {
        json.message = "Casper error:" + msg;
        //outputJson.status = false;
        _finish(json, res);
        logger.info("Casper server occured error, exit");
        server.close();
        casper.exit();
    });
}

function _finish(data, response) {

    _output(JSON.stringify(data), response, 'application/json');
}

function _output(s, response, contentType) {
    response.writeHead(200, {
        'Content-Type': contentType || 'text/plain'
//		'Content-Length': s.length
    });
    response.write(s);
    response.close();
}
