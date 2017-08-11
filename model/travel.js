/**
 * путешествия
 * @type {*|Mongoose}
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Travels = new Schema({
		owner: {},
		beginDate: {},
		endDate: {},
		description: {},
		title: {}
	});

module.exports = mongoose.model('Travels', Travels);