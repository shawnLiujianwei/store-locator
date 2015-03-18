var loader = require("../../../../lib/loader");
var assert = require("assert");
describe("/lib/sites/fr_fr/toysrus.fr.js", function() {
	this.timeout(30000);
	var url = "";
	it("Load product details,should return stock unless this is invalid product url", function(done) {
		url = "http://www.toysrus.fr_fr/family/index.jsp?categoryId=23586271";
		loader.details([url], "de").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it("Load search results,should return links length > 0", function(done) {
		url = "http://www.toysrus.fr_fr/category/index.jsp?categoryId=10849351&foreSeeBrowseSampling=15&foreSeeBrowseLoyalty=1&foreSeeEnabled=true";
		loader.links([url], "de").then(function(data) {
			done();
			console.log("Result:" + JSON.stringify(data));
		});
	});
});