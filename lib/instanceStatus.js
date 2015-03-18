/**
 * Created by Shawn Liu on 2014/12/12.
 */
var dispatcher = require("./dispatcher");
var logger = require("node-config-logger").getLogger("lib/instanceStatus.js");
var config = require("config");
var db = require('mongo-bluebird').create(config.scrapecache.db);
var expressCollection = db.collection("express-log");
var casperCollection = db.collection("casper-server-log");
var memoryLeakCollection = db.collection("memory-leak");
var memroryFootprintCollection = db.collection("memory-footprint");
var ObjectID = require('mongodb').ObjectID;
var Promise = require("bluebird");
exports.insertExpressLog = function (operation, message) {
	return dispatcher.getStatus()
		.then(function (status1) {
			status1.operation = operation;
			status1.operationalInfo = message;
			return expressCollection.insert(status1);
		})
		.catch(function (err) {
			logger.error(err);
		});
}

exports.insertCasperLog = function (data) {
	return casperCollection.insert(data);
}

/**
 *
 * @param type 'memoryLeak' or 'memroryFootprint'
 * @param data
 */
exports.insertMemoryLog = function (type, data) {
	return _getCollection(type).insert(data);
}

exports.getLogs = function (type, filter) {
	var query = {};
	if (filter && filter.ip) {
		query.instanceIp = filter.ip;
	}
	return _getCollection(type).find(query, null, {date: -1}, query.limit);
}

exports.deleteLog = function (type, id) {
	var query = {};
	if (id) {
		query._id = new ObjectID(id);
	}
	return _getCollection(type).remove(query);
}

var _getCollection = function (type) {
	if (type === "express") {
		return expressCollection;
	} else if (type === "casper") {
		return casperCollection;
	} else if (type === "memoryLeak") {
		return memoryLeakCollection;
	} else if (type === "memoryFootprint") {
		return memroryFootprintCollection;
	} else {
		return Promise.reject("There is no log collection for '" + type + "'");
	}
}