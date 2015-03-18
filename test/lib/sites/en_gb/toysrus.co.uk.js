describe("/lib/sites/en_gb/toysrus.co.uk.js", function() {
	this.timeout(30000);
	var loader = require("../../../../lib/loader");
	var url = "http://www.toysrus.co.uk/Toys-R-Us/Toys/Action-Figures-and-Playsets/Playskool-Heroes-Transformers-Rescue-Bots-Heatwave(0131223)?searchPosition=1";
	it("Load product details,should return stock unless this is invalid product url", function(done) {
		loader.details([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});