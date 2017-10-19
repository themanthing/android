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
router.get('/',
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
					position: me.position,
					favorites: me.favorites
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

router.post('/vacation',
	passport.authenticate('bearer', {session: false}),
	function (req, res) {
		log.debug('userId = ' + req.user.userId);
		PeopleModel.findOne({userId: req.user.userId}, function (err, me) {
			// добавляем наше поле

			vacation = new VacationModel({
				beginDate: req.body.beginDate,
				endDate: req.body.endDate,
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
						} else {
							res.status(400);
							return res.status({error: "Bad request"});
						}
					})

				} else {
					res.status(401);
					return res.status({error: "Bad request"});
				}
			});
		});
	}
);


/**
 * добавить избранное
 * //TODO добавить проверку на сущестоввание путешествия
 */
router.post('/favorite',
	passport.authenticate('bearer', {session: false}),
	function (req, res) {
		log.debug('userId = ' + req.user.userId);
		log.debug('travelID = ' + req.query.travelId);

		PeopleModel.findOne({userId: req.user.userId}, function (err, me) {

			if (!err) {
				me.favorites.push(req.query.travelId);
				me.save(function (err) {
					if (!err)
						return res.sendStatus(201);
					else
						return res.sendStatus(500);
				});
			} else {
				res.status(401);
				return res.status({error: "Bad request"});
			}

		});
	}
);

/**
 * удалить избранное
 */
router.delete('/favorite',
	passport.authenticate('bearer', {session: false}),
	function (req, res) {
		log.debug('userId = ' + req.user.userId);
		log.debug('travelID = ' + req.query.travelId);

		PeopleModel.findOne({userId: req.user.userId}, function (err, me) {

			if (!err) {
				var position = me.favorites.indexOf(req.query.travelId);
				if (position !== -1) {

					me.favorites.push(req.query.travelId);
					me.save(function (err) {
						if (!err)
							return res.sendStatus(200);
						else
							return res.sendStatus(500);
					});
				} else {
					// ну нет такой записи ну и фиг с ним)))
					return res.sendStatus(200);
				}
			} else {
				res.status(401);
				return res.status({error: "Bad request"});
			}

		});
	}
);

module.exports = router;