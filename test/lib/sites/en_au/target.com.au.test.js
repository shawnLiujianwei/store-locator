/**
 * Created by shawn on 14-9-26.
 */
var path = require("path");
process.env.NODE_CONFIG_DIR = path.join(__dirname,"../../../../config");
var expect = require("chai").expect;
var server = require("../../../../lib/bakup/server");
describe("test target.com.su.js",function(){
    var casper,productUrl;
    before(function(){
       casper = server.create(8586);
    });

    it("#fetch() product in-stock",function(done){
        productUrl = "http://www.target.com.au/p/nerf-rebelle-dolphina-water-bow-blaster/56180862";
        casper.then(function(port){
            server.scrape([productUrl],"en_au",null,"details",0,port)
                .then(function(res){
                    expect(res).to.have.property("results").and.to.have.length(1);
                    expect(res.results[0]).to.have.property("price_now").and.not.equal("");
                });
        });

    });

    it("#search() search products",function(done){
        productUrl = "http://www.target.com.au/search?text=nerf","http://www.target.com.au/search?text=hasbro";
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