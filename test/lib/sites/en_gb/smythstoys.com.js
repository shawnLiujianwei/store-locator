describe("/lib/sites/en_gb/smythstoys.com.js", function() {
	this.timeout(30000);
	var loader = require("../../../../lib/loader");
	var url = "http://www.smythstoys.com/uk/en-gb/toys/arts-creativity-music/c-538/drawing-boards/p-692/super-colour-doodle-board/";
	it("Load product details,should return stock unless this is invalid product url", function(done) {
		loader.details([url], "en_gb").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});