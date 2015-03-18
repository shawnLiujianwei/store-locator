describe("/lib/sites/en_gb/sainsburys.co.uk.js", function() {
	this.timeout(30000);
	var loader = require("../../../../lib/loader");
	var assert = require("assert");
	it("Load product details,should return stock unless this is invalid product url", function(done) {
		var url = "http://www.sainsburys.co.uk/shop/gb/ProductDisplay?langId=44&storeId=10151&catalogId=10122&productId=86034";
		loader.details([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it("Load search results,should return links length > 0", function(done) {
		var url = "http://www.sainsburys.co.uk/sol/global_search/global_result.jsp?bmForm=global_search&GLOBAL_DATA._search_term1=Nerf&GLOBAL_DATA._searchType=0&bmUID=1403691493772";
		loader.details([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});