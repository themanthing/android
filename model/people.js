var mongoose = require('mongoose'),
	Image = require('./images'),
	validator = require("email-validator"),
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
		}

	}),
	People = new Schema({
		userId: {
			type: String,
			required: true,
			unique: true
		},
		name: {
			type: String,
			required: true
		},
		// мыло
		email: {
			type: String
		},
		// дата рождения
		birthday: {
			type: Date
		},
		// отпуска
		vacations: [Vacation],
		avatar: {
			type:Image
		},
		// организация
		organisation: {
			type: String
		},
		// должность
		position: {
			type: String
		}
		//
	});

// валидируем e-mail
People.path('email').validate(function (v) {
	return validator.validate(v);
});

module.exports.Schema = People;
module.exports.Model = mongoose.model('People', People);