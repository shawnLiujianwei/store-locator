describe("/lib/sites/en_gb/very.co.uk.js", function() {
	this.timeout(30000);
	var loader = require("../../../../lib/loader");
	var url = "http://www.very.co.uk/transformers-bumble-bee/1376768591.prd";
	it("Load product details,should return stock unless this is invalid product url", function(done) {
		loader.details([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});