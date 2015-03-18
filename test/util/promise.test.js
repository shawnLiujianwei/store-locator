
var logger = require("./log.config.test").logger("test/promise.js");
var Promise = require("../../lib/util/promise");

logger.info(Promise);

var pr = new Promise(function(resolve, reject) {
	setTimeout(function() {
		logger.info("timeout complete, calling resolve");
		resolve(2000);
	}, 2000);
}).then(function(data) {
	logger.info("waited " + data + "ms");
	return data/1000;
}).then(function(data) {
	logger.info("waited " + data + "s");
	
	var pr1 = new Promise(function(resolve1, reject1) {
		setTimeout(function() {
			logger.info("timeout complete, calling resolve1");
			resolve1(1000);
		}, 1000);
	}).then(function(data) {
		logger.info("waited " + data + "ms");
		return data/1000;
	});
	logger.info("created " + pr1.id);
	return pr1;
});

