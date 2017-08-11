var express = require('express');
var router = express.Router();
var passport = require('passport');
var log = require('../libs/log')(module);
var PeopleModel = require('../model/people');


/**
 * get User Info
 * информация по пользователю
 */
router.get('/:id',
	passport.authenticate('bearer', {session: false}),
	function (req, res) {

		// получить даные по пользователю
		return PeopleModel.findById(req.params.id, function (err, user) {
			if (!err) {
				return res.send(user);
			} else {
				res.statusCode = 404;
				log.error('Internal error(%s): %s', res.statusCode, err.message);
				return res.send({error: 'Пользователь не найден'});
			}
		});

	});

/**
 * получить свои данные
 */
router.get('/',
	passport.authenticate('bearer', {session: false}),
	function (req, res) {

		PeopleModel.findById(req.user.user_id, function (err, me) {
			if (!err) {
				return res.send(me);
			} else {
				log.debug('аж страшно как-то, свои данные не вижу');
				return res.sendStatus(403);
			}
		});

	});


module.exports = router;
