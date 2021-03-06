var loader = require("../../../../lib/loader");
var assert = require("assert");
describe("/lib/sites/fr_fr/fnac.com.js", function() {
	this.timeout(30000);
	var url = "";
	it("Load product details,should return stock unless this is invalid product url", function(done) {
		url = "http://www4.fnac.com/Hasbro-Nerf-Elite-Rough-Cut/a5589962/w-4";
		loader.details([url], "de").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it("Load search results,should return links length > 0", function(done) {
		url = "http://recherche.fnac.com/SearchResult/ResultList.aspx?SCat=0%211&Search=nerf&sft=1&sa=0&submitbtn=OK";
		loader.links([url], "de").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});