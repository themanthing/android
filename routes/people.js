var express = require('express');
var router = express.Router();
var passport = require('passport');
var log = require('../libs/log')(module);
var PeopleModel = require('../model/people').Model;
var VacationModel = require('../model/people').VacationModel;
const config = require('../libs/config');




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

				var vacation = [];
				people.vacations.forEach(function (t) {
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
					name: people.name,
					parentName: people.parentName,
					userId: people.userId,
					birthday: people.birthday,
					vacations: vacation,
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

						//TODO Отпуск только ближайший нужен

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
