var loader = require("../../../../lib/loader");
var assert = require("assert");
describe("/lib/sites/en_gb/argos.co.uk.js", function() {
	this.timeout(30000);
	var url = "http://www.argos.co.uk/static/Product/partNumber/9149539.htm";
	it("Load product details,should return product information unless it's invalid product url", function(done) {
		loader.details([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it.only("Load search results,should return links length > 0", function(done) {
		var url = "http://www.argos.co.uk/static/Search/searchTerm/g.htm";
		loader.links([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});