var loader = require("../../../../lib/loader");
var assert = require("assert");
describe("/lib/sites/de_de/real.de.js", function() {
	this.timeout(30000);
	var url = "";
	it("Load product details,should return stock unless this is invalid product url", function(done) {
		url = "http://onlineshop.real.de_de/Nerf-N-Strike-Elite-Mega-Darts/0113005001001";
		loader.details([url], "de").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it("Load search results,should return links length > 0", function(done) {
		url = "http://www.real.de_de/suche.html?q=nerf&channel=Onlineshop";
		loader.links([url], "de").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status && data.results[0].links.length>0);
			done();
		});
	});
});