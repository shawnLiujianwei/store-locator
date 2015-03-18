var loader = require("../../../../lib/loader");
var assert = require("assert");
describe("/lib/sites/fr_fr/king-jouet.com.js", function() {
	this.timeout(30000);
	var url = "";
	it("Load product details,should return stock unless this is invalid product url", function(done) {
		url = "http://www.king-jouet.com/jeu-jouet/sport-jeux-plein-air/jeux-adresse-et-sportifs/ref-183512-nerf-hailfire.htm";
		loader.details([url], "de").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it("Load search results,should return links length > 0", function(done) {
		url = "http://www.king-jouet.com/jeux-jouets/recherche/nerf/page1.htm?recherche=nerf";
		loader.links([url], "de").then(function(data) {
			done();
			console.log("Result:" + JSON.stringify(data));
		});
	});
});