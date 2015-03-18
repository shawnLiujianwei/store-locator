/**
 * Created by shawn on 14-9-26.
 */
var path = require("path");
process.env.NODE_CONFIG_DIR = path.join(__dirname,"../../../../config");
var expect = require("chai").expect;
var server = require("../../../../lib/bakup/server");
describe("test kmart.com.su.js",function(){
    var casper,productUrl;
    before(function(){
       casper = server.create(8586);
    });

    it("#fetch() product in-stock",function(done){
        productUrl = "http://www.kmart.com.au/product/spiderman-12-action-figure/128272";
        casper.then(function(port){
            server.scrape([productUrl],"en_au",null,"details",0,port)
                .then(function(res){
                    expect(res).to.have.property("results").and.to.have.length(1);
                    expect(res.results[0]).to.have.property("price_now").and.not.equal("");
                    done();
                });
        });

    });

    it("#search() search products",function(done){
        productUrl = "http://www.kmart.com.au/webapp/wcs/stores/servlet/SearchDisplay?searchTerm=playdoh&categoryId=&storeId=10701&catalogId=10102&langId=-1&pageSize=15&beginIndex=0&sType=SimpleSearch&resultCatEntryType=2&showResultsPage=true&searchSource=Q&pageView=";
        casper.then(function(port){
            server.scrape([productUrl],"en_au",null,"links",0,port)
                .then(function(res){
                    expect(res).to.have.property("results").and.to.have.length(1);
                    expect(res.results[0]).to.have.property("links");
                    expect(res.results[0].links).to.have.length.above(0);
                    done();
                });
        });

    });
})