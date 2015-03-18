
exports.format = function(offerText) {
	return offerText ?
		offerText.replace(/[\t\n\x0B\f\r]/g, "").trim() : "";
};

