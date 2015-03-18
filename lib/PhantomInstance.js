var logger = require("node-config-logger").getLogger("lib/PhantomInstance.js");
var request = require("request");
var events = require("events");
var Promise = require("bluebird");
var Process = require('child_process');
var binPath = "casperjs";
var extend = require('util-extend');
var ScrapeQueue = require("./ScrapeQueue");
var path = require("path");
var config = require("config");
var delay = require("./util/delayPromise")
var maxQueueSize = 500;
var tools = require("./util/tools");
var serverStatus = require("./instanceStatus");
var systemMonitor = require("./systemMonitor");
var dateTimeTool = require("./util/dateTime");
var PhantomInstance = function (options) {
    this.running = false;
    this.listening = false;
    this.emitter = new events.EventEmitter();
    this.port = options.port;
    this.id = "localhost:" + this.port;
    this.startedTime = new Date();
    this.requestOptions = {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            "charset": "utf-8"
        },
        timeout: options.requestTimeout
    };
    this.queue = new ScrapeQueue(this, {
        id: this.id,
        maxSize: maxQueueSize,
        maxRetries: 3
    });
    this.proceed = 0;
    this.failures = 0;
    this.timeoutTimes = 0;
};

function _freeupPortNumber(port) {
    return new Promise(function (resolve, reject) {
        logger.info("freeing up port " + port + " if still in use");
        //var command = "kill -9 `lsof -n -iTCP:" + port + " | grep LISTEN | awk '{print $2}'`";
        var command = "kill $(lsof -t -i:" + port + ")";
        Process.exec(command, function () {
            resolve();
        });
    });
}

PhantomInstance.prototype.start = function () {

    var me = this;

    if (this.listening) {
        return Promise.resolve(this);
    } else if (this.running) {
        return this.startPromise;
    }

    return _freeupPortNumber(this.port).then(function () {
        me.proceed = 0;
        me.failures = 0;
        me.startedTime = new Date();
        var childArgs = [
            "--ssl-protocol=any",// avoid "SSL handshake failed"
            path.join(__dirname, "./casperjs-server.js"),
            me.port
        ];

        var options = {};
        options.env = process.env;
        if (config.casper && config.casper.logLevel) {
            extend(options.env, {
                CASPER_LOG_LEVEL: config.casper.logLevel,
                CASPER_LOG_FILE: config.casper.logFile
            });
            //childArgs.unshift("--log-level=" + config.casper.logLevel);
        }

        me.process = Process.spawn(binPath, childArgs, options);
        logger.info("Phantomjs worker " + me.id + " started");

        /*
         ps.stdout.on('data', function(data) {
         data = data.toString();
         if (data && data.indexOf("Fatal") !== -1) {
         logger.error("Phantomjs stdout:", data);
         } else {
         logger.debug("Phantomjs stdout:", data);
         }
         });
         */

        //me.process.stdout.on('data', function (data) {
        //    logger.debug("phantomjs worker " + me.id + " stdout:", data.toString())
        //});

        me.process.stderr.on('data', function (data) {
            logger.error("phantomjs worker " + me.id + " stderr:", data.toString())
        });

        me.process.on("error", function (msg) {
            logger.error("phantomjs worker " + me.id + " error:", msg);
            me.emitter.emit("error", msg);
        });

        me.process.on("exit", function (code) {
            logger.info("phantomjs worker " + me.id + " exit with code:", code);
            me.running = false;
            me.listening = false;
            me.emitter.emit("exit");
        });


        // check is phantomjs server is responding every 200ms for a max of 5000ms
        me.startPromise = _waitAvailable(me, 5000, 200);
        me.running = true;

        ////// start a timer to limit process life time
        if (config.maxWorkerLifetime) {
            delay(config.maxWorkerLifetime * 1000).then(function () {
                logger.warn("Phantom process(job queue) meet the max worker life time '" + config.maxWorkerLifetime / 60 + " minutes' , need shutdown(restart) it(will be restarted after proceed all existing jobs ");
                me.queue.shutdown("Meet the max worder life time '" + config.maxWorkerLifetime / 60 + " minutes'");
            });
        }

        return me.startPromise;
    });
};

PhantomInstance.prototype.failureRateWarn = function () {
    var me = this;
    if (me.failures / (me.proceed + me.failures) > config.casper.failureRate.rate && me.proceed > config.casper.failureRage.proceed) {
        var msg = "failure rate lager than " + config.casper.failureRate * 100 + "%";
        logger.warn(me.id + " " + msg + ", will restart it");
        me.queue.shutdown(msg);
    }
}

function _waitAvailable(instance, timeout, minWait) {
    if (timeout < 0) {
        logger.warn("phantomjs worker " + instance.id + " start timeout exceeded");
        //return _recordLog(instance, "start", "start timeout exceeded")
        //	.then(function () {
        return Promise.reject("start timeout exceeded");
        //});
    } else {
        return instance.ping()
            .then(function () {
                instance.listening = true;
                logger.info("phantomjs worker " + instance.id + " listening on port " + instance.port);
                return instance;
                //return _recordLog(instance, "start", "start instance")
                //	.then(function () {
                //		return instance;
                //	});
            })
            .catch(function (err) {
                //logger.info("ping error during startup : ", err);
                return delay(minWait).then(function () {
                    return _waitAvailable(instance, timeout - minWait, minWait * 2);
                });
            });
    }
}

function _recordLog(instance, operation, message, postData) {
    return tools.getExternalIp()
        .then(function (ip) {

            return systemMonitor.processUsage(instance.process.pid)
                .then(function (useage) {
                    var tmp = {
                        "instanceIp": ip,
                        "port": instance.port,
                        "lifetime": dateTimeTool.fromToNow(instance.startedTime),
                        "usage": useage,
                        "proceed": instance.proceed,
                        "failures": instance.failures,
                        "operation": operation,
                        "operationalInfo": message,
                        "date": new Date()
                    };
                    tmp.postData = postData;
                    return serverStatus.insertCasperLog(tmp);
                })

        })
        .catch(function (err) {
            logger.error(err);
        });
}

PhantomInstance.prototype.restart = function (msg, postData) {
    var me = this;
    return this.stop(msg, postData).then(function () {
        return me.start();
    })
};

PhantomInstance.prototype.request = function (path, postData) {
    var me = this;
    var url = "http://127.0.0.1:" + this.port + path;
    var options = extend({
        url: url,
        json: postData
    }, this.requestOptions);
    options.headers['Content-Length'] = options.json ? Buffer.byteLength(JSON.stringify(options.json)) : 0;

    return new Promise(function (resolve, reject) {
        request.post(options, function (err, res, data) {
            if (err) {
                if (me.listening) {
                    logger.warn("phantomjs worker " + me.id + " request error: ", err);
                    switch (err.code) {

                        case 'ESOCKETTIMEDOUT':
                        case 'ETIMEDOUT':
                            // if timeout or connection reset, process is probably hosed.
                            // attempt to restart it before the next request comes
                            me.failures++;
                            //_recordLog(me, "kill", err.code)
                            //    .then(function () {
                            me.listening = false;
                            me.running = false;
                            //me.restart();
                            //})
                            //.then(function () {
                            logger.error(postData);
                            me.timeoutTimes++;
                            if (me.timeoutTimes > config.maxTimeoutTimes) {
                                me.timeoutTimes = 0;
                                return me.restart(err.code, postData)
                                    .finally(function () {
                                        reject({
                                            message: "phantomjs timeout",
                                            retry: true
                                        });
                                    })
                            } else {
                                reject({
                                    message: "phantomjs timeout",
                                    retry: true
                                });
                            }
                            //})
                            //.then(function () {
                            reject({
                                message: "phantomjs timeout",
                                retry: true
                            });
                            // });
                            //me.process.kill();
                            //me.listening = false;
                            //me.running = false;
                            //
                            //me.start().then(function () {
                            //	reject({
                            //		message: "phantomjs timeout",
                            //		retry: true
                            //	});
                            //});
                            break;

                        default:
                            me.failures++;
                            reject({
                                message: err.code
                            });

                    }
                } else {
                    me.failures++;
                    reject(err);
                }
            } else {
                if (url.indexOf("/ping") == -1)
                    me.proceed++;
                resolve(data);
            }
        });
    });

};

PhantomInstance.prototype.ping = function () {
    return this.request("/ping");
};

PhantomInstance.prototype.stop = function (message, postData) {
    //logger.warn("phantomjs worker " + this.id + " stopping");
    var me = this;
    logger.warn("phantomjs worker " + me.id + " will be killed with message '%s'", message);
    // sending a message failed.  fallback to doing a force kill.
    return _recordLog(me, "kill", message, postData)
        .then(function () {
            //me.process.kill(me.process.pid,"SIGHUP");
            return _freeupPortNumber(me.port);
        })
        .then(function () {
            return delay(200);
        })
    //// send an exit message
    //return this.request("/exit")
    //	.then(function () {
    //		me.listening = false;
    //		return _recordLog(me, "exit", message);
    //	})
    //	.catch(function (err) {
    //		logger.warn("phantomjs worker " + me.id + " will be killed.");
    //		// sending a message failed.  fallback to doing a force kill.
    //		return _recordLog(me, "kill", message)
    //			.then(function () {
    //				me.process.kill();
    //				return delay(200);
    //			})
    //		//me.process.kill();
    //		//return delay(200);
    //	});
};


PhantomInstance.prototype.on = function (event, listener) {
    this.emitter.on(event, listener);
    return this;
};


PhantomInstance.prototype.status = function () {
    return this.status;
};

PhantomInstance.prototype.isListening = function () {
    return this.listening;
};

PhantomInstance.prototype.isRunning = function () {
    return this.running;
};

module.exports = PhantomInstance;
