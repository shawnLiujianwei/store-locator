var loader = require("../../../../lib/loader");
var assert = require("assert");
describe("/lib/sites/en_gb/chemistdirect.co.uk.js", function() {
	this.timeout(30000);
	it("Load product details, should return product information unless it's invalid product url", function(done) {
		var url = "http://www.chemistdirect.co.uk/curanail-5-nail-lacquer-amorolfine-treatment/prd-gtg";
		loader.details([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it.only("Load search results,should return links length > 0", function(done) {
		var url = "http://results.chemistdirect.co.uk/search?w=regaine";
		loader.links([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});