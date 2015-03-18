/**
 * Created by liujianwei on 2014/9/22.
 */
var Price = require("../../lib/util/price");
var expect = require("chai").expect;
describe("Format price",function(){

    it("#format() UK price with unit Pound",function(){
        var price = "price is £4.00";
        price = Price.format(price,2);
        expect(price).to.equal("4.00");
    });

    it("#format() format price with the specified float",function(){
        var price = "price is £4";
        price = Price.format(price,3);
        expect(price).to.equal("4.000");
    });

    it("#format() UK price with unit penny ",function(){
        var price = "the price is 99 p";
        price = Price.format(price,2);
        expect(price).to.equal("0.99");
    });

    it("#format() Germany amazon price",function(){
        var price = "the price is EUR 15,75";
        price = Price.format(price,2);
        expect(price).to.equal("15.75");
    });

    it("#format() European price with unit in the middle",function(){
        var price = "the price is  15€75";
        price = Price.format(price,2);
        expect(price).to.equal("15.75");
    });

    it("#format() European price with unit at the star",function(){
        var price = "the price is  €15,75";
        price = Price.format(price,2);
        expect(price).to.equal("15.75");
    });
});