var loader = require("../../../../../lib/loader");
var assert = require("assert");
describe("/lib/sites/en_gb/tesco.com/groceries.sainsburys.co.uk.js", function() {
	this.timeout(60000);
	var url = "http://www.tesco.com/groceries/Product/Details/?id=259808881";
	it("Load product details, should return product information unless it's invalid product url", function(done) {
		loader.details([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it("Load search results,should return links length > 0", function(done) {
		var url = "http://www.tesco.com/groceries/product/search/default.aspx?searchBox=food&icid=tescohp_sws-1_food";
		loader.links([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});