describe("/lib/sites/en_gb/argos.co.uk.js", function() {
    this.timeout(30000);
    var loader = require("../../../../lib/loader");
    it("Load product details,should return stock unless this is invalid product url", function(done) {
        var url = "http://www.weldricks.co.uk/product/0151001_kwells-tablets-0-3mg-pack-of-12?source=home";
        loader.details([url], "en_gb").then(function(data) {
           assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
        });
    });
    it("Load search results,should return links length > 0", function(done) {
        var url = "http://www.weldricks.co.uk/search?q=Bio&filters=%2Fsearch%2Fnon-presc";
        loader.links([url], "en_gb").then(function(data) {
            assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
        });
    });
});