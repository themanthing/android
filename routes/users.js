var express = require('express');
var router = express.Router();
var log   = require('../libs/log')(module);
var UserModel = require('../libs/mongoDB').UserModel;


/* GET users listing. */
router.get('/:id', function(req, res, next) {

    // получить даные по пользователю

	return UserModel.findById(req.params.id, function (err, user) {
		if (!err) {
			return res.send(user);
		} else {
			res.statusCode = 404;
			log.error('Internal error(%s): %s',res.statusCode,err.message);
			return res.send({ error: 'Пользователь не найден' });
		}
	});

});




module.exports = router;
