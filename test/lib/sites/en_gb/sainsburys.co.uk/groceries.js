var loader = require("../../../../../lib/loader");
var assert = require("assert");
describe("/lib/sites/en_gb/sainsburys.co.uk/groceries.sainsburys.co.uk.js", function() {
	this.timeout(60000);
	var url = "http://www.sainsburys.co.uk/shop/gb/groceries/burgers-bbq/sainsburys-chinese-loin-steaks-600g-7618333-p-44";
	it("Load product details, should return product information unless it's invalid product url", function(done) {
		loader.details([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it("Load search results,should return links length > 0", function(done) {
		var url = "http://www.sainsburys.co.uk/webapp/wcs/stores/servlet/SearchDisplayView?catalogId=10122&langId=44&storeId=10151&krypto=kOnEsrtkyQ8UiYY5pvenKkb%2Bj2%2F5IlROutuw3RfVuan9nSXT%2FiNtVfNeNe%2BlUZ2NhwJYP2Px7Adq%0ATIyBZGGuPrImeLFLLluaANj%2F0JRvwDlYpkSqOjFyC2mrmGUflhAvPWqliWWaZlgg9Q%2BWJaLozBEF%0AjmytbPZtn1b4MBWVljX1uY%2BlaqVhaAJeMmId8oJ%2BdzxhBb9Ss3Af%2FP3b0TMJDE1cD2nvoMXoYMnD%0A2iaPXYMiq0mizRE00kO4mQ4ICw1h#langId=44&storeId=10151&catalogId=10122&categoryId=&parent_category_rn=&top_category=&pageSize=30&orderBy=RELEVANCE&searchTerm=food&beginIndex=0&categoryFacetId1=";
		loader.links([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});