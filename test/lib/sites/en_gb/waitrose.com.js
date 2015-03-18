describe("/lib/sites/en_gb/waitrose.com.js", function() {
	this.timeout(30000);
	var loader = require("../../../../lib/loader");
	it("Load product details,should return stock unless this is invalid product url", function(done) {
		var url = "http://www.waitrose.com/shop/DisplayProductFlyout?productId=43#.UsvdqXnNCMM";
		loader.details([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it.only("Load search results,should return links length > 0", function(done) {
		var url = "http://www.waitrose.com/shop/HeaderSearchCmd?searchTerm=Milk&defaultSearch=None&search=";
		loader.links([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
			
		});
	});
});