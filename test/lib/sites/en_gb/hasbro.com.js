var loader = require("../../../../lib/loader");
var assert = require("assert");
describe("/lib/sites/en_gb/hasbro.com.js", function() {
	this.timeout(30000);
	var url = "http://www.hasbro.com/playdoh/en_GB/shop/browse.cfm/Play-Doh/_/N-1rZ77Zgu/?Items=48";
	it("Load product details,should return product information unless it's invalid product url", function(done) {
		loader.details([url], "en_gb").then(function(data) {
			console.log(data);
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});