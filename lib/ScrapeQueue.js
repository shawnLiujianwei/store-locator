var logger = require("node-config-logger").getLogger("lib/ScrapeQueue.js");
var Promise = require("bluebird");
var config = require("config");
var async = require("async");
var delay = require("./util/delayPromise");
var systemMonitor = require("./systemMonitor");
var tools = require("./util/tools");
var ScrapeQueue = function (phantomInstance, options) {
    this.phantom = phantomInstance;
    this.jobs = [];
    this.processing = false;
    this.options = options || {
        maxRetries: 3
    };
    this.id = this.options.id || phantomInstance.id || '?';
    this.jobsProcessed = 0;
    this.shuttingDown = false;
    this.shutdownMessage = "";
};

ScrapeQueue.prototype.size = function () {
    return this.jobs.length;
};

ScrapeQueue.prototype.push = function (page, batch1) {
    if (this.options.maxSize && this.jobs.length >= this.options.maxSize) {
        logger.warn('Scrape queue ' + this.id + ' is full : ' + this.jobs.length);
        return false;
    }

    if (this.shuttingDown) {
        logger.warn("Scrape queue " + this.id + " is going to be shut down , refuse receving request");
        return false;
    }

    var q = this;


    if (q.jobsProcessed === config.maxWorkerJobs) {
        logger.warn('Scrape queue (' + q.phantom.id + ') has meet the max job length "' + q.jobsProcessed + '" , will restart it after process all requests ');
        q.shuttingDown = true;
        return false;
    } else {
        q.jobsProcessed++;
        q.jobs.push(page);
        logger.info('New job added to job queue ' + q.id + '.  total=' + q.jobs.length);
    }

    if (!this.processing) {
        this.processing = true;
        logger.info('Resuming job queue ' + q.id + ' processing');

        async.until(
            function () {
                return q.jobs.length == 0;
            },
            function (callback) {
                var job = q.jobs.shift();
                job.attempt = job.attempt || 1;
                var batch = job.batchRequest || batch1;
                delete job.batchRequest;
                logger.info('job queue ' + q.id + ' - scraping ' + job.url + ' for request ' + batch.id);
                q.phantom.request("/scrape", job).then(function (data) {
                    if (data.hasOwnProperty('results') && data.results.length) {
                        logger.info('job queue ' + q.id + ' - ' + job.url + " scraped successfully - batch " + batch.id);

                        // add timestamp for cache invalidations
                        data.results.forEach(function (el) {
                            el.time = new Date();
                        });
                        batch.appendResults(data.results);
                        callback();
                    } else {
                        logger.warn("no results in response: ");
                        logger.error(data);
                        logger.warn("to job:");
                        logger.warn(job);
                        //TODO  here may miss some request.
                        //delay(500).then(function() {callback();});
                        batch.appendResults({
                            status: false,
                            url: job.url,
                            message: data.message || "no results in reponse from casper instance"
                        });
                        callback();
                    }
                }).catch(function (err) {
                    logger.error("Failed to process ", job, " with ", err.message);
                    if (err.retry && job.attempt++ <= q.options.maxRetries) {
                        q.jobs.unshift(job);
                    } else {
                        batch.appendResults({
                            status: false,
                            url: job.url,
                            message: err.message
                        });
                    }
//							batch.abort(err);
                    //delay(500).then(function() {callback();});
                    callback();
                });
                //	}
                //});

            },
            function () {
                // check if should shutdown
                var delayT = 0;
                if (q.shuttingDown) {
                    delayT = tools.random(5, 10) * 1000;
                }
                delay(delayT)
                    .then(function () {
                        var memoryUsage = systemMonitor.getMemoryUsage();
                        if (q.jobsProcessed === config.maxWorkerJobs) {
                            logger.warn("Job queue " + q.id + " has scraped the max worker jobs " + config.maxWorkerJobs + " and have proceed all existing jobs , will restart it right now.");
                            q.shuttingDown = true;
                            _shutdown(q, "Meet the max proceed jobs '" + config.maxWorkerJobs + "'");
                        } else if (memoryUsage > config.listener.memoryUsage) {
                            //q.shuttingDown = true;
                            //_shutdown(q, "The memory usage is higher than " + config.listener.memoryUsage * 100 + "% , stop instance for releasing memory");
                        } else {
                            _shutdown(q, q.shutdownMessage);
                        }
                        q.processing = false;
                        logger.info('Scrape queue ' + q.id + ' is now empty');
                    })

            });
    }
    return true;
};

function _shutdown(q, message) {
    if (q.shuttingDown) {
        q.phantom.stop(message);
        q.shuttingDown = false;
    }
}

ScrapeQueue.prototype.filter = function (filter) {
    // todo use splice instead of filter

    this.jobs = this.jobs.filter(filter);
    if (!this.jobs.length) {
        this.processing = false;
        //_shutdown(this,"there exist outstanding jobs, need restart instance");
        // TODO in the phantom.queue may also has jobs from other BatchRequest
        // means the same phantom instance is using by multiply BatchRequest, so can't remote ourstanding job
        // so can't restart it
    }
};

ScrapeQueue.prototype.shutdown = function (message) {
    // worker needs to shutdown.  do it when queue is empty.
    this.shuttingDown = true;
    if (!this.processing) {
        _shutdown(this, message);
    } else {
        this.shutdownMessage = message;
    }

};

module.exports = ScrapeQueue;