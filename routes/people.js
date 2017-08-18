var express = require('express');
var router = express.Router();
var passport = require('passport');
var log = require('../libs/log')(module);
var PeopleModel = require('../model/people').Model;
const config = require('../libs/config');


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
router.get('/me',
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

/**
 * получить список пользователей
 */
router.get('/:page',
	passport.authenticate('bearer', {session: false}),
	function (req, res) {

		log.debug('попросили у нас страничку people с page = ' + req.params.page);
		var page = req.params.page,
			perPage = config.get('default:paging:pageSize');

		if (isNaN(page)){
			return res.sendStatus(404);
		}

		if (page <= 0){
			page = 1;
		}
		page--;
		log.debug('page = ' + page);

		PeopleModel.find()
			.limit(perPage)
			.skip(perPage * page)
			.sort({
				beginDate: 'desc'
			})
			.exec(function (err, peoples) {
				if (!err){
					return res.send(peoples);
				}else{
					// ничего не нашли(
					log.error('Internal error(%s): %s', res.statusCode, err.message);
					return res.sendStatus(404);
				}
			});

	});

module.exports = router;
