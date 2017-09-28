var mongoose = require('mongoose'),
	Image = require('./images'),
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
		// сколько дней
		daysCount: {
			type: Number,
			required: true
		},
		type: {
			type: String,
			required: true
		},
		// куда я хочу
		direction: {
			type: String,
			required: true
		}

	}),
	People = new Schema({
		// ссылка на пользователя
		userId: {
			type: String,
			required: true,
			unique: true,
			index: true
		},
		// имя
		name: {
			type: String,
			required: true
		},
		// фамилия
		parentName: {
			type: String,
			required: true
		},
		// дата рождения
		birthday: {
			type: Date,
			required: true
		},
		// отпуска
		vacations: [Vacation],
		// аватар
		avatar: {
			type:Image
		},
		sex: {
			type: String,
			enum: ['male', 'female'],
			required: true
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

module.exports.Schema = People;
module.exports.Model = mongoose.model('People', People);
module.exports.VacationModel = mongoose.model('Vacation', Vacation);