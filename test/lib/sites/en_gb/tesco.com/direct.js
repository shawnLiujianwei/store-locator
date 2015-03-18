var loader = require("../../../../../lib/loader");
var assert = require("assert");
describe("/lib/sites/en_gb/tesco.com/direct.tesco.com.js", function() {
	this.timeout(60000);
	var url = "http://www.tesco.com/direct/ben-10-omniverse-alien-collection-figure-spidermonkey/145-1082.prd?pageLevel=&skuId=145-1082";
	it("Load product details, should return product information unless it's invalid product url", function(done) {
		loader.details([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it("Load search results,should return links length > 0", function(done) {
		var url = "http://www.tesco.com/direct/search-results/results.page;jsessionid=2B094AF1AE35C72CF1DC752AE20517D0.UKTUL09LF73V_slot1?catId=4294967294&searchquery=mobile&SrchId=4294967294&_requestid=2337768";
		loader.links([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});