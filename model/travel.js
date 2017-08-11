/**
 * путешествие
 * @type {*|Mongoose}
 */
var mongoose = require('mongoose'),
	Images = require('./images').Schema,
	People = require('./people').Schema,
	Schema = mongoose.Schema,
	Travels = new Schema({
		userId: {
			type: String,
			required: true
		},
		beginDate: {
			type: Date,
			required: true
		},
		endDate: {
			type: Date,
			required: true
		},
		description: {
			type: String,
			required: true
		},
		title: {
			type: String,
			required: true
		},
		images: [Images],
		have_joined: [People]
	});

// проверка путешествия
Travels.path('beginDate').validate(function (field) {
	return field >= Date.now();
});

Travels.path('endDate').validate(function (field) {
	return field >= Date.now();
});

// заголовок не может быть пустым
Travels.path('title').validate(function (v) {
	return v.length > 5 && v.length < 150;
});

Travels.path('description').validate(function (v) {
	return v.length > 5 && v.length < 350;
});

module.exports = mongoose.model('Travels', Travels);