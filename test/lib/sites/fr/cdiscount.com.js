    var loader = require("../../../../lib/loader");
	var assert = require("assert");
describe("/lib/sites/fr_fr/cdiscount.com.js", function() {
    this.timeout(30000);
    var url = "";
    it("Load product details,should return stock unless this is invalid product url", function(done) {
        url = "http://www.cdiscount.com/juniors/plein-air/nerf-vortex-pistolet-proton/f-12004040304-has32214e310.html";
        loader.details([url], "de").then(function(data) {
            assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
        });
    });
    it("Load search results,should return links length > 0", function(done) {
        url = "http://www.cdiscount.com/search/10/nerf.html#_his_";
        loader.links([url], "de").then(function(data) {
            assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
        });
    });
});