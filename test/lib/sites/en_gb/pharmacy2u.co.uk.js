var loader = require("../../../../lib/loader");
var assert = require("assert");
describe("/lib/sites/en_gb/pharmacy2u.co.uk.js", function() {
	this.timeout(30000);
	it("Load product details,should return stock unless this is invalid product url", function(done) {
		var url = "http://www.pharmacy2u.co.uk/regaine-foam-extra-strength-for-men-triple-pack-p5921.html";
		loader.details([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it.only("Load search results,should return links length > 0", function(done) {
		var url = "http://www.pharmacy2u.co.uk/searchresults.aspx?keywords=Oreal";
		loader.links([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});