/**
 * модель отпускы
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Vacation = new Schema({
		// дата начала
		beginDate: {
			type: Date,
			required: true
		},
		// дата окончания
		endDate: {
			type: Date,
			required: true
		},

	});

module.exports = mongoose.model('Vacation', Vacation);