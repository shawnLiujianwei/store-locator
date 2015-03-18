/**
 * Created by shawn on 14-9-26.
 */
var path = require("path");
process.env.NODE_CONFIG_DIR = path.join(__dirname,"../../../../config");
var expect = require("chai").expect;
var server = require("../../../../lib/bakup/server");
describe("test myer.com.su.js",function(){
    var casper,productUrl;
    before(function(){
       casper = server.create(8586);
    });

    it("#fetch() product in-stock",function(done){
        productUrl = "http://www.myer.com.au/shop/mystore/kids-toys/arts-crafts/nerf-nerf-601962670-248962060--1";
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
        productUrl = "http://www.myer.com.au/webapp/wcs/stores/servlet/SearchDisplay?storeId=10251&catalogId=10051&langId=-1&beginIndex=0&searchSource=Q&sType=SimpleSearch&resultCatEntryType=2&showResultsPage=true&pageView=image&pageSize=12&orderBy=0&storeSearch=Y&searchTerm=nerf";
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