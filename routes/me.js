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
 * получить список избранного
 */
router.get('/favorite',
	passport.authenticate('bearer', {session: false}),
	function (req, res) {

	}
);

module.exports = router;