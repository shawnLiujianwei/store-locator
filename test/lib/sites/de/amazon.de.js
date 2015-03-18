var loader = require("../../../../lib/loader");
var assert = require("assert");
describe("/lib/sites/de_de/amazon.de.js", function() {
	this.timeout(30000);
	var url = "";
	it("Load product details", function(done) {
		url = "http://www.amazon.de_de/Apple-MacBook-Notebook-Intel-Core-GeForce/dp/B00G4D3BPI/ref=sr_1_2?ie=UTF8&qid=1404201034&sr=8-2&keywords=macbook+pro";
		loader.details([url], "de").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it("Load search results,should return links length > 0", function(done) {
		url = "http://www.amazon.de_de/s/ref=nb_sb_noss/276-6138976-4763848?__mk_de_DE=%C3%85M%C3%85%C5%BD%C3%95%C3%91&url=search-alias%3Daps&field-keywords=macbook%20pro";
		loader.links([url], "de").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});