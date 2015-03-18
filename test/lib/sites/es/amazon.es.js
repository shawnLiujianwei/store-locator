var loader = require("../../../../lib/loader");
var assert = require("assert");
describe("/lib/sites/es_es/amazon.es.js", function() {
	this.timeout(30000);
	var url = "";
	it("Load product details", function(done) {
		url = "http://www.amazon.es_es/Nerf-36033E24-Elite-Strongarm-DYD-6/dp/B009NFH7CC/ref=sr_1_1?ie=UTF8&qid=1406533927&sr=8-1&keywords=Nerf";
		loader.details([url], "es").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it("Load search results,should return links length > 0", function(done) {
		url = "http://www.amazon.es_es/s/ref=nb_sb_noss_1/279-3552516-6000416?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&url=search-alias%3Daps&field-keywords=Nerf";
		loader.links([url], "es").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});