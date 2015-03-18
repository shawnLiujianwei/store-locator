	var loader = require("../../../../../lib/loader");
	var assert = require("assert");
describe("/lib/sites/en_gb/direct.asda.com.js", function() {
	this.timeout(30000);
	var url = "http://direct.asda.com/Transformers-Wheeljack/000746644,default,pd.html";
	it("Load product details,should return stock unless this is invalid product url", function(done) {
		loader.details([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});