var should = require('should');
var PhantomInstance = require("../../lib/PhantomInstance");
var config = require("config");
var Promise = require('bluebird');
var delay = require("../../lib/util/delayPromise");

describe('PhantomInstance', function() {
	var options = {
		port: 2014,
		requestTimeout: 1000
	};

	beforeEach(function () {
	});

	afterEach(function () {
	});

	after(function () {
	});

	it('can be started then stopped', function (done) {
		this.timeout(10000);
		var instance = new PhantomInstance(options);
		var exitEventReceived = false;

		instance
			.on("exit", function() {
				exitEventReceived = true;
			})
			.start()
			.then(function() {
				instance.isListening().should.be.true;
				instance.isRunning().should.be.true;
				return delay(1000).then(function() {
					return instance.stop()
						.then(function() {
							instance.isListening().should.be.false;
							return delay(1000).then(function() {
								instance.isRunning().should.be.false;
								exitEventReceived.should.be.true;
								done();
							});
						})
						.catch(function() {
							fail("could not stop process");
						});
				});
			});
	});

	it.skip('cannot be started twice with the same port', function (done) {
		this.timeout(10000);
		var instance1 = new PhantomInstance(options);
		var instance2 = new PhantomInstance(options);
		var exit1EventReceived = false;
		var exit2EventReceived = false;

		instance1
			.on("exit", function () {
				exit1EventReceived = true;
			})
			.start()
			.then(function () {
				instance1.isListening().should.be.true;
				instance1.isRunning().should.be.true;
				return instance2
					.on("exit", function () {
						exit2EventReceived = true;
					})
					.start()
					.then(function () {
						instance2.isListening().should.be.false;
						return delay(500);
					});
			}).then(function () {
				instance2.isRunning().should.be.false;
				exit2EventReceived.should.be.true;
				return instance1.stop().then(function () {
					return delay(500).then(function () {
						instance1.isRunning().should.be.false;
						exit1EventReceived.should.be.true;
						done();
					});
				})
					.catch(function () {
						fail("could not stop process");
					});


			});
	});

});
