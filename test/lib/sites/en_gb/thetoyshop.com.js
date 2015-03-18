describe("/lib/sites/en_gb/thetoyshop.com.js", function() {
	this.timeout(30000);
	var loader = require("../../../../lib/loader");
	var url = "http://www.thetoyshop.com/Transformers/Transformers-Age-Of-Extinction/Transformers-Age-of-Extinction---Flip-and-Change-Optimus-Prime-Figure/p/517608_A6144";
	it("Load product details,should return stock unless this is invalid product url", function(done) {
		loader.details([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});