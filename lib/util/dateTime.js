/**
 * Created by Shawn Liu on 2014/12/12.
 */
var moment = require("moment");
var _duration = function (timeSpan) {
	var days = Math.floor(timeSpan / 86400000);
	var diff = timeSpan - days * 86400000;
	var hours = Math.floor(diff / 3600000);
	diff = diff - hours * 3600000;
	var minutes = Math.floor(diff / 60000);
	diff = diff - minutes * 60000;
	var secs = Math.floor(diff / 1000);
	return {'days': days || 0, 'hours': hours || 0, 'minutes': minutes || 0, 'seconds': secs || 0};
};

function _getRemainigTime(referenceTime) {
	var now = moment().utc();
	return now - moment(referenceTime);
}

exports.fromToNow = function (startedTime) {
	var remain = _getRemainigTime(startedTime);
	var duration = _duration(remain);
	var tmp = "";
	if (duration.days > 0) {
		tmp += (duration.days > 0 ? (duration.days + " days ") : (duration.day + " day "));
	}
	tmp += (duration.hours > 0 ? (duration.hours + " hours ") : (duration.hours + " hour "));
	tmp += (duration.minutes > 0 ? (duration.minutes + " minutes ") : (duration.minutes + " minute "));
	tmp += (duration.seconds > 0 ? (duration.seconds + " seconds ") : (duration.seconds + " second "));
	return tmp;
}