describe("/lib/sites/de_de/spielemax.de.js", function() {
    this.timeout(30000);
    var loader = require("../../../../lib/loader");
    var url = "";
    it("Load product details,should return stock unless this is invalid product url", function(done) {
        url = "http://www.spielemax.de_de/spider-man-ultimate-web-shooter.html";
        loader.details([url], "de").then(function(data) {
           assert.equal(true, data.status && data.results[0] && data.results[0].status);
            done();
        });
    });
    it("Load search results,should return links length > 0", function(done) {
        url = "http://www.spielemax.de_de/catalogsearch/result/?q=nerf";
        loader.links([url], "de").then(function(data) {
            assert.equal(true, data.status && data.results[0] && data.results[0].status);
            done();
        });
    });
});