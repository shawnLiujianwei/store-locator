describe("/lib/sites/de_de/galeria-kaufhof.de.js", function() {
    this.timeout(30000);
    var loader = require("../../../../lib/loader");
    var url = "";
    it("Load product details,should return stock unless this is invalid product url", function(done) {
        url = "http://www.galeria-kaufhof.de_de/store/p/Torres-Vina-Esmeralda-weiss-2013/1000289784";
        loader.details([url], "de").then(function(data) {
            assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
        });
    });
    it("Load search results,should return links length > 0", function(done) {
        url = "http://www.galeria-kaufhof.de_de/store/view/search?customersearch=true&initialSearch=122989020018260544085459&query=wine";
        loader.links([url], "de").then(function(data) {
           assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
        });
    });
});