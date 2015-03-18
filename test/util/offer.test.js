/* jshint expr: true */
var expect = require("chai").expect;
var offerParser = require('../../lib/util/offerParser');

describe('Offer', function(){

	describe('parse', function(){

		var offerTexts = {
			morrisons: {
				'1.0': 'Was £1.65, now £1',
				'1.1': 'Half price - Was £1.98, now £0.95',
				'2.0': 'Buy 2 for £4',
				'3.0': 'Buy One And Add One'
			},
			ocado: {
				'1.0': 'Save 25%, was 90p',
				'1.2': 'Save 1/3, was £3.15',
				'3.0': 'Buy 1 add 1 free',
				only: 'Only £7, was £12'
			},
			tesco: {
				'1.3': 'Better than half price. Was £2.25',
				'3.0': '3 for 2',
				'3.0b': 'Buy 1 get 1 free'
			},
			waitrose: {
				'2.0': 'Add 2 you save £1',
				'3.0': 'Add 2 for the price of 1'
			}
		};
		
		it('returns an empty offer if no matches are found', function () {
			// ok === truthy
			// not.ok === falsy
			var offerText = 'this text will not match any offer type patterns';
			var offer = offerParser.parse(offerText);
			expect(offer.type).to.not.be.ok;
			expect(offer.savings(1)).to.not.be.ok;
			expect(offer.shortText()).to.equal('');
			expect(offer.mediumText()).to.equal('');
			expect(offer.longText()).to.equal('');
			expect(offer.quantity).to.not.be.ok;
			expect(offer.text).to.equal(offerText);
		});

		it('returns sensible values for discounts when there is no was price', function () {
			var offerText1 = 'Half price with no was price';
			var offerText2 = 'save 1/4 without was price';
			var offer1 = offerParser.parse(offerText1);
			var offer2 = offerParser.parse(offerText2);

			expect(offer1.type).to.not.be.ok;
			expect(offer1.savings(1)).to.not.be.ok;
			expect(offer1.shortText()).to.equal('');
			expect(offer1.mediumText()).to.equal('');
			expect(offer1.longText()).to.equal('');
			expect(offer1.quantity).to.not.be.ok;
			expect(offer1.text).to.equal(offerText1);

			expect(offer2.type).to.not.be.ok;
			expect(offer2.savings(1)).to.not.be.ok;
			expect(offer2.shortText()).to.equal('');
			expect(offer2.mediumText()).to.equal('');
			expect(offer2.longText()).to.equal('');
			expect(offer2.quantity).to.not.be.ok;
			expect(offer2.text).to.equal(offerText2);
		});

		describe('discounts', function() {

			it('parses "was - now" offers correctly', function() {
				var offer = offerParser.parse(offerTexts.morrisons['1.0'], 1);
				expect(offer.type).to.equal(1.0);
				expect(offer.savings(2)).to.equal(1.3);
				expect(offer.shortText()).to.equal('Save 65p');
				expect(offer.mediumText()).to.equal('Save 65p. Was £1.65');
				expect(offer.longText()).to.equal('Save 65p. Was £1.65 now £1');
				expect(offer.quantity).to.equal(1);
				expect(offer.text).to.equal(offerTexts.morrisons['1.0']);
			});

			it('parses "Half price" offers correctly', function() {
				var offer = offerParser.parse(offerTexts.morrisons['1.1'], 0.95);
				expect(offer.type).to.equal(1.1);
				expect(offer.savings(1)).to.equal(1.98 - 0.95);
				expect(offer.shortText()).to.equal('Half Price');
				expect(offer.mediumText()).to.equal('Half Price. Was £1.98');
				expect(offer.longText()).to.equal('Half Price. Was £1.98 now 95p');
				expect(offer.quantity).to.equal(1);
			});

			it('parses "save 1/3" offers correctly', function() {
				var offer = offerParser.parse(offerTexts.ocado['1.2'], 0.95);
				expect(offer.type).to.equal(1.2);
				expect(offer.savings(1)).to.equal(3.15 - 0.95);
				expect(offer.shortText()).to.equal('Save 1/3');
				expect(offer.mediumText()).to.equal('Save 1/3. Was £3.15');
				expect(offer.longText()).to.equal('Save 1/3. Was £3.15 now 95p');
				expect(offer.quantity).to.equal(1);
			});

			it('parses "save 25%" offers correctly', function() {
				var offer = offerParser.parse(offerTexts.ocado['1.0'], 0.75);
				expect(offer.type).to.equal(1.0);
				expect(offer.savings(1)).to.equal(parseFloat((0.90 - 0.75).toFixed(2)));
				expect(offer.shortText()).to.equal('Save 15p');
				expect(offer.mediumText()).to.equal('Save 15p. Was 90p');
				expect(offer.longText()).to.equal('Save 15p. Was 90p now 75p');
				expect(offer.quantity).to.equal(1);
			});

			it('parses "only" offers correctly', function() {
				var offer = offerParser.parse(offerTexts.ocado.only, 7);
				expect(offer.type).to.equal(1.0);
				expect(offer.savings(1)).to.equal(12 - 7);
				expect(offer.shortText()).to.equal('Save £5');
				expect(offer.mediumText()).to.equal('Save £5. Was £12');
				expect(offer.longText()).to.equal('Save £5. Was £12 now £7');
				expect(offer.quantity).to.equal(1);
			});

			it('parses "better than half" offers correctly', function() {
				var offer = offerParser.parse(offerTexts.tesco['1.3'], 1);
				expect(offer.type).to.equal(1.3);
				expect(offer.savings(1)).to.equal(2.25 - 1);
				expect(offer.shortText()).to.equal('Half Price +');
				expect(offer.mediumText()).to.equal('Better than Half Price. Was £2.25');
				expect(offer.longText()).to.equal('Better than Half Price. Was £2.25 now £1');
				expect(offer.quantity).to.equal(1);
			});

		});

		describe('MBP', function () {
			it('parses "Buy q for price" offers correctly"', function() {
				var offer = offerParser.parse(offerTexts.morrisons['2.0'], 3);
				expect(offer.type).to.equal(2.0);
				expect(offer.quantity).to.equal(2);

				expect(offer.savings(1)).to.equal(0);
				expect(offer.savings(2)).to.equal(2 * 3 - 4);
				expect(offer.savings(3)).to.equal(2 * 3 - 4);
				expect(offer.savings(4)).to.equal(4 * 3 - 2 * 4);

				expect(offer.shortText()).to.equal('2 for £4');
				expect(offer.mediumText()).to.equal('Buy 2 for £4');
				expect(offer.longText()).to.equal('Buy 2 for £4. Save total of £2');
			});

			it('parses "Add q you save price" offers correctly"', function() {
				var offer = offerParser.parse(offerTexts.waitrose['2.0'], 2.19);
				expect(offer.type).to.equal(2.0);
				expect(offer.quantity).to.equal(2);

				expect(offer.savings(1)).to.equal(0);
				expect(offer.savings(2)).to.equal(1);
				expect(offer.savings(3)).to.equal(1);
				expect(offer.savings(8)).to.equal(4);

				expect(offer.shortText()).to.equal('2 for £3.38');
				expect(offer.mediumText()).to.equal('Buy 2 for £3.38');
				expect(offer.longText()).to.equal('Buy 2 for £3.38. Save total of £1');
			});
		});

		describe('MBB', function () {
			it('parses "Buy One Add One" offers correctly', function() {
				var offer = offerParser.parse(offerTexts.morrisons['3.0'], 2);
				expect(offer.type).to.equal(3.0);
				expect(offer.quantity).to.equal(2.0);

				expect(offer.savings(1)).to.equal(0);
				expect(offer.savings(2)).to.equal(2);
				expect(offer.savings(3)).to.equal(2);
				expect(offer.savings(4)).to.equal(4);

				expect(offer.shortText()).to.equal('2 for 1');
				expect(offer.mediumText()).to.equal('Buy 1 get 1 free');
				expect(offer.longText()).to.equal('Buy 1 get 1 free. Save total of £2');
			});

			it('parses "Buy 1 add 1 free" offers correctly', function() {
				var offer = offerParser.parse(offerTexts.ocado['3.0'], 2);
				expect(offer.type).to.equal(3.0);
				expect(offer.quantity).to.equal(2.0);

				expect(offer.savings(1)).to.equal(0);
				expect(offer.savings(2)).to.equal(2);
				expect(offer.savings(3)).to.equal(2);
				expect(offer.savings(4)).to.equal(4);

				expect(offer.shortText()).to.equal('2 for 1');
				expect(offer.mediumText()).to.equal('Buy 1 get 1 free');
				expect(offer.longText()).to.equal('Buy 1 get 1 free. Save total of £2');
			});

			it('parses "3 for 2" offers correctly', function() {
				var offer = offerParser.parse(offerTexts.tesco['3.0'], 1.8);
				expect(offer.type).to.equal(3.0);
				expect(offer.quantity).to.equal(3.0);

				expect(offer.savings(1)).to.equal(0);
				expect(offer.savings(2)).to.equal(0);
				expect(offer.savings(3)).to.equal(1.8);
				expect(offer.savings(6)).to.equal(3.6);

				expect(offer.shortText()).to.equal('3 for 2');
				expect(offer.mediumText()).to.equal('Buy 2 get 1 free');
				expect(offer.longText()).to.equal('Buy 2 get 1 free. Save total of £1.80');
			});

			it('parses "Add 2 for the price of 1" offers correctly', function() {
				var offer = offerParser.parse(offerTexts.waitrose['3.0'], 2.19);
				expect(offer.type).to.equal(3.0);
				expect(offer.quantity).to.equal(2.0);

				expect(offer.savings(1)).to.equal(0);
				expect(offer.savings(2)).to.equal(2.19);
				expect(offer.savings(3)).to.equal(2.19);
				expect(offer.savings(4)).to.equal(4.38);

				expect(offer.shortText()).to.equal('2 for 1');
				expect(offer.mediumText()).to.equal('Buy 1 get 1 free');
				expect(offer.longText()).to.equal('Buy 1 get 1 free. Save total of £2.19');
			});

			it('parses "Buy 1 get 1 free" offers correctly', function() {
				var offer = offerParser.parse(offerTexts.tesco['3.0b'], 1.90);
				expect(offer.type).to.equal(3.0);
				expect(offer.quantity).to.equal(2.0);

				expect(offer.savings(1)).to.equal(0);
				expect(offer.savings(2)).to.equal(1.90);
				expect(offer.savings(3)).to.equal(1.90);
				expect(offer.savings(4)).to.equal(3.80);

				expect(offer.shortText()).to.equal('2 for 1');
				expect(offer.mediumText()).to.equal('Buy 1 get 1 free');
				expect(offer.longText()).to.equal('Buy 1 get 1 free. Save total of £1.90');
			});

		});
	});
});
