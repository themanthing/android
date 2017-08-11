var express = require('express');
var router = express.Router();
var passport = require('passport');
var log = require('../libs/log')(module);
var TravelModel = require('../model/travel');
var config = require('../libs/config');

/*
 * получить поездки пользователя
 */
router.get('/:user_id', passport.authenticate('bearer', {session: false}),
	function (req, res) {
		// получить даные по пользователю

		TravelModel.find({userId: req.params.user_id}, function (err, travels) {
			if (!err) {
				return res.send(travels);
			} else {
				res.statusCode = 404;
				log.error('Internal error(%s): %s', res.statusCode, err.message);
				return res.send({error: 'Пользователь не найден'});
			}
		});

	});

// получить 1-ю страницу
router.get('/', function (req, res) {
	return res.redirect('/api/travels/1');
});

/**
 * получить список поездок
 * вернет список путешествий так как все через листания, то пачками отдает
 * типа страница 2 в n записей в ней
 */
router.get('/:page', passport.authenticate('bearer', {session: false}),
	function (req, res) {

		log.debug('попросили у нас страничку travels с page = ' + req.params.page);
		var page = req.params.page,
			perPage = config.get('default:paging:pageSize');

		if (page <= 0){
			page = 1;
		}
		page--;
		log.debug('page = ' + page);
		TravelModel.find()
			.limit(perPage)
			.skip(perPage * page)
			.sort({
				beginDate: 'desc'
			})
			.exec(function (err, travels) {

				if (!err){
					return res.send(travels);
				}else{
					// ничего не нашли(
					return res.sendStatus(404);
				}

			});
	});

/**
 * создать запрос на поездку
 */
router.post('/', passport.authenticate('bearer', {session: false}),
	function (req, res) {

		log.debug('Создаем запись');
		var travel = new TravelModel(JSON.parse(req.body));
		travel.userId = req.user.user_id;

		travel.save(function (err) {
			if (!err) {
				// создали все ок
				return res.sendStatus(201);
			} else {
				if (err.name === 'ValidationError') {
					res.statusCode = 400;
					res.json({
						error: 'Validation error'
					});
				} else {
					res.statusCode = 500;

					log.error('Internal error(%d): %s', res.statusCode, err.message);

					res.json({
						error: 'Server error'
					});
				}
			}
		});

	});


module.exports = router;
