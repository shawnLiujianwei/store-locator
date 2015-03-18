    var loader = require("../../../../lib/loader");
	var assert = require("assert");
describe("/lib/sites/fr_fr/auchan.fr.js", function() {
    this.timeout(30000);
    var url = "";
    it("Load product details,should return stock unless this is invalid product url", function(done) {
        url = "http://www.auchan.fr_fr/jeux--jouets/figurine-toupie-pistolet/pistolet-nerf-jeux-de_de-tir/nerf-pistolet-elite-rough-cut-multis/achat4/6860377/C378874/Recherche";
        loader.details([url], "de").then(function(data) {
            assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
        });
    });
    it("Load search results,should return links length > 0", function(done) {
        url = "http://www.auchan.fr_fr/achat7/11124969/?from=redirectSearch&textSearch=nerf&category=searchMode:manualSearch|searchDisplayType:null|searchEngine=new";
        loader.links([url], "de").then(function(data) {
            assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
        });
    });
});