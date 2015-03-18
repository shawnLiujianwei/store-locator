describe("/lib/sites/en_gb/ocado.com.js", function() {
	this.timeout(30000);
	var loader = require("../../../../lib/loader");
	var url = "http://www.ocado.com/webshop/product/Nicorette-Fresh-Fruit-Low-Strength-2mg-Gum/48347011?from=search&tags=%7C20000&param=nicorette&parentContainer=SEARCHnicorette_SHELFVIEW";
	it("Load product details,should return stock unless this is invalid product url", function(done) {
		loader.details([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});
