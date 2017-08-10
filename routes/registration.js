/**
 * логика регистрации пользователя
 */
var log = require('../libs/log')(module);
var Client = require('../libs/mongoDB').CientModel;

router.post('/', function (req, res, next) {

	if (!req.body.command) {
		// ошибка ничего не передали
		log.error('empty body');
		res.statusCode = 400;
		return res.send({error: "Неккоректный запрос"})
	}

	var client = new Client({

	});

	client.save(function (err) {


	});

	res.statusCode = 201;
	return res.send();
});

module.exports = router;