var loader = require("../../../../lib/loader");
var assert = require("assert");
describe("/lib/sites/en_gb/groceries.asda.com.js", function() {
	this.timeout(30000);
	var url = "http://groceries.asda.com/asda-webstore/landing/home.shtml#/product/23755916";
	it("Load product details,should return stock unless this is invalid product url", function(done) {
		loader.details([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it("Load search results,should return links length > 0", function(done) {
		var url = "http://groceries.asda.com/asda-webstore/landing/home.shtml#/search/food";
		loader.links([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});
