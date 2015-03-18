/**
 * Created by liujianwei on 2014/12/15.
 */
var Promise = require("bluebird");
exports.getExternalIp = function () {
	return new Promise(function (resolve, reject) {
		require('dns').lookup(require('os').hostname(), function (err, add, fam) {
			if (err) {
				reject(err);
			} else {
				resolve(add);
			}
		})
	})
}

exports.random = function (min, max) {
	var array = [];
	for (var i = min; i < max + 1; i++) {
		array.push(i);
	}
	return array[Math.floor(Math.random() * array.length)];
}