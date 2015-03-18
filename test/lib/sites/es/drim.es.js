var loader = require("../../../../lib/loader");
var assert = require("assert");
describe("/lib/sites/es_es/drim.es.js", function() {
	this.timeout(30000);
	var url = "";
	it("Load product details", function(done) {
		url = "http://www.drim.es_es/armas_y_accesorios_es/equipo_vision_nerf_rebelle__es.aspx";
		loader.details([url], "es").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it("Load search results,should return links length > 0", function(done) {
		url = "http://www.drim.es_es/buscador.aspx?b=nerf";
		loader.links([url], "es").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});