/**
 * логика регистрации пользователя
 */
var log = require('../libs/log')(module);
var express = require('express');
var router = express.Router();

router.post('/', function (req, res, next) {

	if (!req.body.command) {
		// ошибка ничего не передали
		log.error('empty body');
		res.statusCode = 400;
		return res.send({error: "Неккоректный запрос"})
	}

	res.statusCode = 201;
	return res.send();
});

module.exports = router;