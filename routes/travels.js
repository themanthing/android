var express = require('express');
var router = express.Router();
var passport = require('passport');
var log = require('../libs/log')(module);
var TravelModel = require('../model/travel');
const config = require('../libs/config');

/*
 * получить поездки пользователя
 */
router.get('/my', passport.authenticate('bearer', {session: false}),
	function (req, res) {
		// получить даные по пользователю

		TravelModel.find({userId: req.user.userId}, function (err, travels) {
			if (!err) {

				var travel = [];
				travels.forEach(function (t) {
					travel.push({
						id: t._id,
						beginDate: t.beginDate,
						endDate: t.endDate,
						images: t.images,
						peoples: t.peoples
					});
				});

				return res.send(travel);
			} else {
				res.statusCode = 404;
				log.error('Internal error(%s): %s', res.statusCode, err.message);
				return res.send({error: 'Пользователь не найден'});
			}
		});

	}
);


/**
 * получить список поездок
 * вернет список путешествий так как все через листания, то пачками отдает
 * типа страница 2 в n записей в ней
 *
 * TODO выдавать только рабочие путешествия
 */
router.get('/:page', passport.authenticate('bearer', {session: false}),
	function (req, res) {

		log.debug('попросили у нас страничку travels с page = ' + req.params.page);
		var page = req.params.page,
			perPage = config.get('default:paging:pageSize');

		if (isNaN(page)) {
			return res.sendStatus(404);
		}

		if (page <= 0) {
			page = 1;
		}
		page--;
		log.debug('page = ' + page);
		TravelModel.find({'userId':{'$ne': req.user.userId}})
			.limit(perPage)
			.skip(perPage * page)
			.sort({
				beginDate: 'desc'
			})
			.exec(function (err, travels) {

				if (!err) {
					return res.send(travels/*.map(function (travel) {
						return {
							id: travel._id,
							name: travel.title,

						}
					})*/);
				} else {
					// ничего не нашли(
					log.error('Internal error(%s): %s', res.statusCode, err.message);
					return res.sendStatus(404);
				}

			});
	}
);

/**
 * создать запрос на поездку
 */
router.post('/', passport.authenticate('bearer', {session: false}),
	function (req, res) {

		log.debug('Создаем запись');
		log.debug("req = " + req.body);
		var travel = new TravelModel(req.body);
		travel.userId = req.user.userId;
		log.debug('travel = ' + travel);
		travel.save(function (err) {
			if (!err) {
				// создали все ок
				return res.sendStatus(201);
			} else {
				log.error("error", err);
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

	}
);


module.exports = router;
