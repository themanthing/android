var mongoose = require('mongoose');
var log = require('./log')(module);
var config = require('./config');
var validator = require("email-validator");
var crypto = require('crypto');

mongoose.connect(config.get('mongoose:main'));


var db = mongoose.connection;

db.on('error', function (err) {
	log.error('connection error:', err.message);
	throw err;
});
db.once('open', function callback() {
	log.info("Connected to DB!");

});

var Schema = mongoose.Schema;


// картинки
var Images = new Schema({
	kind: {
		type: String,
		enum: ['thumbnail', 'detail'],
		required: true
	},
	url: {
		type: String,
		required: true
	}
});

// клиент
var Client = new Schema({
	// логин, пустой когда через VK или Facebook
	login: {
		type: String,
		max: 30,
		min: 5,
		required: false
	},
	// как авторизоваля если native значит через нас
	auth_via: {
		type: String,
		enum: ['native', 'vk', 'facebook'],
		required: true
	},
	// собственно ID сети от которой мы зарегались
	social_id: {
		type: String
	},
	token: {
		type: String
	},
	hashedPassword: {
		type: String,
		required: true
	},
	salt: {
		type: String,
		required: true
	},
	created: {
		type: Date,
		default: Date.now
	}
});

var ClientModel = mongoose.model('Client', Client);

// отпуск
var Vacation = new Schema({
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

// пользователи
var User = new Schema({
	clientId: {
		type: String,
		unique: true,
		required: true
	},
	username: {
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
	vacations: [Vacation]
});

// проверка параметров пользователя
User.path('username').validate(function (v) {
	return v.length > 5 && v.length < 150;
});

// проверка email
User.path('email').validate(function (v) {
	return validator.validate(v);
});

var UserModel = mongoose.model('User', User);

var Messages = new Schema({
	message: {}
});

var Travel = new Schema({
	// автор
	author: {
		type: User,
		required: true
	},
	// описание
	description: {
		type: String,
		required: true
	},
	// картинки
	images: [Images],
	// дата создания/изменения
	modified: {
		type: Date,
		default: Date.now
	},
	// участники
	members: [User]

});

module.exports.ClientModel = ClientModel;
module.exports.UserModel = UserModel;

