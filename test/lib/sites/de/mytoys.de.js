describe("/lib/sites/de_de/mytoys.de.js", function() {
    this.timeout(30000);
    var loader = require("../../../../lib/loader");
    var url = "";
    it("Load product details,should return stock unless this is invalid product url", function(done) {
        url = "http://www.mytoys.de_de/Super-Soaker-NERF-Super-Soaker-Tidal-Tube-2er-Pack/Wasserspa%C3%9F/Spielen-im-Freien/KID/de_de-mt.to.ca02.17.01.04/3396629";
        loader.details([url], "de").then(function(data) {
           assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
        });
    });
    it("Load search results,should return links length > 0", function(done) {
        url = "http://www.mytoys.de_de/catalog/search?query=Nerf&button=Suche+starten&productsPerPage=40&sugg=false";
        loader.links([url], "de").then(function(data) {
           assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
        });
    });
});