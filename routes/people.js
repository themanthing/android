var express = require('express');
var router = express.Router();
var passport = require('passport');
var log = require('../libs/log')(module);
var PeopleModel = require('../model/people').Model;
var VacationModel = require('../model/people').VacationModel;
const config = require('../libs/config');

/**
 * получить свои данные
 */
router.get('/me',
	passport.authenticate('bearer', {session: false}),
	function (req, res) {
		log.debug('userId = ' + req.user.userId);
		PeopleModel.findOne({userId: req.user.userId}, function (err, me) {
			if (!err) {
				log.debug('получили пользователя: ' + me);

				var vacation = [];
				me.vacations.forEach(function (t) {
					//TODO проверка а действует ли отпуск
					vacation.push({
						beginDate: t.beginDate,
						endDate: t.endDate,
						daysCount: t.daysCount,
						type: t.type,
						direction: t.direction,
						vacationId: t._id
					})
				});

				return res.send({
					name: me.name,
					parentName: me.parentName,
					userId: me.userId,
					birthday: me.birthday,
					vacations: vacation,
					avatar: me.avatar,
					sex: me.sex,
					organisation: me.organisation,
					position: me.position
				});
			} else {
				log.debug('аж страшно как-то, свои данные не вижу');
				return res.sendStatus(403);
			}
		});

	}
);

/**
 * создать отпуск
 */

router.post('/me/vacation',
	passport.authenticate('bearer', {session: false}),
	function (req, res) {
		log.debug('userId = ' + req.user.userId);
		PeopleModel.findOne({userId: req.user.userId}, function (err, me) {
			// добавляем наше поле

			vacation = new VacationModel({
				beginDate : req.body.beginDate,
				endDate : req.body.endDate,
				daysCount: req.body.daysCount,
				type: req.body.type,
				direction: req.body.direction
			});

			log.debug('отпуск = ' + vacation);

			vacation.save(function (err) {
				if (!err) {

					log.debug("создали отпуск");

					me.vacations.push(vacation);
					log.debug("пытаемся связать отпуск и пользователя");
					// сохраняем
					me.save(function (err) {
						if (!err) {
							return res.sendStatus(201);
						}else{
							res.status(400);
							return res.status({error: "Bad request"});
						}
					})

				}else{
					res.status(401);
					return res.status({error: "Bad request"});
				}
			});
		});
	}
);

/**
 * get User Info
 * информация по пользователю
 */
router.get('/:id',
	passport.authenticate('bearer', {session: false}),
	function (req, res) {

		// получить даные по пользователю
		return PeopleModel.find({userId: req.params.id}, function (err, people) {
			if (!err) {
				return res.send({
					name: people.name,
					parentName: people.parentName,
					userId: people.userId,
					birthday: people.birthday,
					vacations: people.vacations,
					avatar: people.avatar,
					sex: people.sex,
					organisation: people.organisation,
					position: people.position
				});
			} else {
				res.statusCode = 404;
				log.error('Internal error(%s): %s', res.statusCode, err.message);
				return res.send({error: 'Пользователь не найден'});
			}
		});

	}
);

/**
 * получить список пользователей
 */
router.get('/all/:page',
	passport.authenticate('bearer', {session: false}),
	function (req, res) {

		log.debug('попросили у нас страничку people с page = ' + req.params.page);
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

		PeopleModel.find({'userId': {'$ne': req.user.userId}})
			.limit(perPage)
			.skip(perPage * page)
			.sort({
				beginDate: 'desc'
			})
			.exec(function (err, peoples) {
				if (!err) {
					return res.send(peoples.map(function (people) {
						return {
							name: people.name,
							parentName: people.parentName,
							userId: people.userId,
							birthday: people.birthday,
							vacations: people.vacations,
							avatar: people.avatar,
							sex: people.sex,
							organisation: people.organisation,
							position: people.position
						}
					}));
				} else {
					// ничего не нашли(
					log.error('Internal error(%s): %s', res.statusCode, err.message);
					return res.sendStatus(404);
				}
			});

	}
);

module.exports = router;
