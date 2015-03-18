var loader = require("../../../../lib/loader");
var assert = require("assert");
describe("/lib/sites/en_gb/lloydspharmacy.com.js", function() {
	this.timeout(30000);
	it("Load product details, should return product information unless it's invalid product url", function(done) {
		var url = "http://www.lloydspharmacy.com/en/forza-raspberry-k2-90-capsules-274295";
		loader.details([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it("Load search results,should return links length > 0", function(done) {
		var url = "http://www.lloydspharmacy.com/webapp/wcs/stores/servlet/AjaxCatalogSearchView?storeId=10151&catalogId=11101&langId=44&pageSize=24&beginIndex=0&sType=SimpleSearch&resultCatEntryType=2&showResultsPage=true&pageView=image&searchTerm=regaine&searchBtn=";
		loader.links([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});