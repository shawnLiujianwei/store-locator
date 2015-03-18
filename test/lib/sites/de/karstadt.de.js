describe("/lib/sites/de_de/karstadt.de.js", function() {
    this.timeout(30000);
    var loader = require("../../../../lib/loader");
    var url = "";
    it("Load product details,should return stock unless this is invalid product url", function(done) {
        url = "http://www.karstadt.de_de/Esprit-Damen-Schlupfbluse-gemustert/30735663.html";
        loader.details([url], "de").then(function(data) {
           assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
        });
    });
    it("Load search results,should return links length > 0", function(done) {
        url = "http://www.karstadt.de_de/search?q=sports";
        loader.links([url], "de").then(function(data) {
            assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
        });
    });
});