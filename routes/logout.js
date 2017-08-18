/**
 * прото выход из учетки
 * @type {*|createApplication}
 */
var express = require('express');
var router = express.Router();
var passport = require('passport');
var log = require('../libs/log')(module);

router.get('/', passport.authenticate('bearer', {session: false}),
	function (req, res) {
		log.debug('попытка выхода из аккаунта');
		// надо удалить токены
	}
);

module.exports = router;