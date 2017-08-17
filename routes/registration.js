/**
 * логика регистрации пользователя
 */
var log = require('../libs/log')(module);
var express = require('express');
var passport = require('passport');
var router = express.Router();
var UserModel = require('../model/user');
var PeopleModel = require('../model/people').Model;

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

			if (err){
				log.error('Internal error(%d): %s', res.statusCode, err.message);
				res.statusCode = 400;
				return res.send({error: 'Validation error'});
			}else{

				people.save(function (err) {

					if (err){
						log.error('Internal error(%d): %s', res.statusCode, err.message);
						user.remove(function (err) {
							if (err) {
								log.error('Internal error(%d): %s', res.statusCode, err.message);
							}
						});
						res.statusCode = 400;
						return res.send({error: 'Validation error'});
					}else{
						return res.sendStatus(201);
					}

				});
			}

		});

	});

module.exports = router;