var loader = require("../../../../lib/loader");
var assert = require("assert");
describe("/lib/sites/fr_fr/joueclub.fr.js", function() {
	this.timeout(30000);
	var url = "";
	it("Load product details", function(done) {
		url = "http://joueclub.fr_fr/produits_article.aspx?id_univ=9&id_cat=72&sku=14063129";
		loader.details([url], "de").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
	it("Load search results,should return links length > 0", function(done) {
		url = "http://joueclub.fr_fr/produits_categorie.aspx?id_marque=846";//nerf
		//url = "http://joueclub.fr_fr/produits_categorie.aspx?id_hero=33";//transformers
		loader.links([url], "de").then(function(data) {
			assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
		});
	});
});