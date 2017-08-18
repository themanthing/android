/**
 * логика регистрации пользователя
 */
var log = require('../libs/log')(module);
var express = require('express');
var passport = require('passport');
var router = express.Router();
var UserModel = require('../model/user');
var PeopleModel = require('../model/people').Model;
const emailValidator = require('email-validator');

// это регистрация пользователя обычного
router.post('/',
	passport.authenticate('basic', {session: false}),
	function (req, res) {

		log.debug('client = ' +
			req.user);

		var user = new UserModel(req.body);
		user.auth_via = 'native';
		log.debug('user = ' + user);

		var people = new PeopleModel(req.body);
		people.userId = user._id;
		log.debug('people = ' + people);

		user.save(function (err) {

			if (err) {
				log.error('Internal error(%d): %s', res.statusCode, err.message);
				res.statusCode = 400;
				return res.send({error: 'Validation error'});
			} else {

				people.save(function (err) {

					if (err) {
						log.error('Internal error(%d): %s', res.statusCode, err.message);
						user.remove(function (err) {
							if (err) {
								log.error('Internal error(%d): %s', res.statusCode, err.message);
							}
						});
						res.statusCode = 400;
						return res.send({error: 'Validation error'});
					} else {
						return res.sendStatus(201);
					}

				});
			}

		});

	}
);

/**
 * проверка на существование e-mail в БД а то мало ли
 * TODO нужна страница сброса пароля в дальнейшем :)
 */
router.get('/', passport.authenticate('basic', {session: false}),
	function (req, res) {

		if (!emailValidator.validate(req.body.email)){
			res.status(400);
			return res.send({error: 'Некокретный e-mail адресс'});
		}

		UserModel.findOne({username: req.body.email}, function (err, user) {

			// нет ошибки и есть такой пользователь, то беда
			if (!err && user){
				res.status(409); // conflict
				return res.send({error: "пользователь с таким e-mail уже сещуетсвует"});
			}else{
				return res.sendStatus(200);
			}

		});
	}
);

module.exports = router;