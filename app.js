var express = require('express');
var http = require('http');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var dispatcher = require("./lib/dispatcher");
var systemMonitor = require("./lib/systemMonitor");
var responseTime = require('response-time');
var instanceStatus = require("./lib/instanceStatus");
var tools = require("./lib/util/tools");
var config = require("config");
// all environments
var app = express();
app.use(responseTime());
app.use(logger('dev')); 					// log every request to the console
app.use(bodyParser.json());
app.use(cookieParser());
app.use(compression());
var routes = require("./routes");
routes.load(app, express);
app.set("port", config.listener.port);

dispatcher.create().then(function () {
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
        //systemMonitor.start();
        setTimeout(function () {
            // require("./locator").startBackgroundJob();
            systemMonitor.start();
        }, 1000 * 60 * 3);
        require("./locator").startBackgroundJob();
        //setTimeout(function(){
        //    systemMonitor.restartExpress()
        //},10000)
    });
})
    .catch(function (err) {
        console.error("Error when init phantom instance", err);
        systemMonitor.restartExpress();
    })
