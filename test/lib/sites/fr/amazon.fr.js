    var loader = require("../../../../lib/loader");
	var assert = require("assert");
describe("/lib/sites/fr_fr/amazon.fr.js", function() {
    this.timeout(30000);
    var url = "";
    it("Load product details,should return stock unless this is invalid product url", function(done) {
        url = "http://www.amazon.fr_fr/Nerf-A03511480-Plein-Elite-Recharges/dp/B008ML1S6Y/ref=sr_1_1?ie=UTF8&qid=1404910789&sr=8-1&keywords=nerf";
        loader.details([url], "de").then(function(data) {
            assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
        });
    });
    it("Load search results,should return links length > 0", function(done) {
        url = "http://www.amazon.fr_fr/s/ref=nb_sb_noss?__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&url=search-alias%3Daps&field-keywords=nerf";
        loader.links([url], "de").then(function(data) {
            assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
        });
    });
});