var loader = require("../../../../lib/loader");
var assert = require("assert");
describe("/lib/sites/es_es/carrefour.es.js", function() {
	this.timeout(30000);
	var url = "";
	it("Load product details", function(done) {
		url = "http://www.carrefouronline.carrefour.es_es/noalimentacion/TemplateProduct.aspx;jsessionid=375BB90807909AA3E8F6E87129EEC28F.fronttecno3?itemMarcado=catalog580004&navAction=jump&navCount=0&nivel_desplegado=&itemId=160601408";
		loader.details([url], "es").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it("Load search results,should return links length > 0", function(done) {
		url = "http://www.carrefouronline.carrefour.es_es/noalimentacion/BusquedaResultados.aspx?_requestid=766657";
		loader.links([url], "es").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});