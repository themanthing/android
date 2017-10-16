/**
 * путешествие
 * @type {*|Mongoose}
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Travels = new Schema({
		// создатель поездки
		userId: {
			type: String,
			required: true,
			unique: false
		},
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
		// описание
		description: {
			type: String,
			required: true
		},
		// заголовок
		title: {
			type: String,
			required: true
		},
		// картинки
		images: [String],
		// кто присоеденился id пользователей
		have_joined: [String],
		// цена
		price: {
			type: Number,
			required: true
		}
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