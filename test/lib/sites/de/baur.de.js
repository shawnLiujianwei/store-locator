    var loader = require("../../../../lib/loader");
describe("/lib/sites/de_de/baur.de.js", function() {
    this.timeout(30000);
    var url = "";
    it("Load product details,should return stock unless this is invalid product url", function(done) {
        url = "http://www.baur.de_de/pantolette-betula/pref-AKL10029997672%40BaurDe-Shop/artikel/baur-de_de";
        loader.details([url], "de").then(function(data) {
           assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
        });
    });
    it("Load search results,should return links length > 0", function(done) {
        url = "http://www.baur.de_de/online-shop/servlet/SearchServlet?clientId=BaurDe&prodDetailUrl=http%3A%2F%2Fwww.baur.de_de%2Fis-bin%2FINTERSHOP.enfinity%2FWFS%2FBaurDe-Shop-Site%2Fde_DE%2F-%2FEUR%2FViewProductDetail-Start%3FProductRef%3D%253CSKU%253E%2540BaurDe-Shop%26SearchBack%3D-1%26SearchDetail%3Dtrue&source=&resultsPerPage=24&searchandbrowse=&https=0&query=leather";
        loader.links([url], "de").then(function(data) {
            assert.equal(true, data.status && data.results[0] && data.results[0].status);
			done();
        });
    });
});