/**
 * Created by jbelis on 9/30/14.
 */
var should = require('should');
var PhantomInstance = require("../../lib/PhantomInstance");
var config = require("config");
var Promise = require('bluebird');
var delay = require("../../lib/util/delayPromise");
var sinon = require('sinon');
var BatchRequest = require("../../lib/BatchRequest");
var ScrapeQueue = require("../../lib/ScrapeQueue");

describe('ScrapeQueue', function() {
	var stubs = [];
	var options = {
		port: 2014,
		requestTimeout: 1000
	};

	var phantomStub = {
		request: function (path, data) {
			return delay(500).then(function () {
				if (data.fail) {
					return Promise.reject({
						message: "fail",
						status: false
					});
				} else if (data.timeout) {
					return Promise.reject({
						retry: true,
						message: "fail",
						status: false
					});
				} else {
					var results = data.reduce(function (arr, el) {
						arr.push({
							url: el.url,
							status: true
						});
						return arr;
					}, []);
					return Promise.resolve({
						status: true,
						results: results
					});
				}
			});
		}
	};

	beforeEach(function () {
		var cache = {};
		stubs.push(sinon.stub(dispatcher, "scrape"))
	});

	afterEach(function () {
		stubs.forEach(function(stub) {
			stub.restore();
		});
	});

	after(function () {
	});

	function _createTestPages(urls) {
		return urls.reduce(function(arr, el) {
			arr.push({
				url: el.url || el,
				failme: !!el.fail,
				timeout: !!el.timeout
			});
			return arr;
		}, []);
	}

	it('can process successful scrape requests', function (done) {
		this.timeout(10000);
		var q = new ScrapeQueue(phantomStub, {id: "localhost:test"});
		var urls = ["http://1", "http://2", "http://3"];
		var batch = new BatchRequest(_createTestPages(urls), {
			id: "test"
		});
		batch.process(q).then(function(response) {
			response.status.should.be.true;
			response.results.should.be.ok;
			response.results.length.should.be.exactly(3);
			response.results[0].status.should.be.true;
			response.results[1].status.should.be.true;
			response.results[2].status.should.be.true;
			done();
		});
	});

	it('can process cached scrape requests', function (done) {
		this.timeout(10000);
		var q = new ScrapeQueue(phantomStub, {id: "localhost:test"});
		var urls = ["http://1", "http://2", "http://3"];
		var batch = new BatchRequest(_createTestPages(urls), {
			id: "1"
		});
		batch.process(q).then(function(response) {
			response.status.should.be.true;
			response.results.should.be.ok;
			response.results.length.should.be.exactly(3);
			done();
		});

		// new batch
		urls = ["http://1", "http://22", "http://3"];
		batch = new BatchRequest(_createTestPages(urls), {
			id: "2"
		});
		batch.process(q).then(function(response) {
			response.status.should.be.true;
			response.results.should.be.ok;
			response.results.length.should.be.exactly(3);
			response.results[0].cached.should.be.true;
			response.results[1].cached.should.not.be.true;
			response.results[2].cached.should.be.true;
			done();
		});

	});

	it.skip('can process failed scrape requests', function (done) {
	});

	it.skip('can retry timed out scrape requests', function (done) {
	});

});
