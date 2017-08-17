
var express = require('express');
var router = express.Router();
var passport = require('passport');
var log = require('../libs/log')(module);
var path = require('path');
var fs = require('fs');
var md5 = require('md5');
const Jimp = require('jimp');
const config = require('../libs/config');
var PeopleModel = require('../model/people').Model;

/**
 * сохранение картинок
 * картинки я буду складыватьт в папочку по {user_id}/travel/{date}/id.jpg
 * пока что поддерживает загрузку ТОЛЬКО jpg остальное спасибо не надо)
 */
router.post('/', passport.authenticate('bearer', {session: false}),
	function (req, res) {
		log.debug('получаем файл');
		var tempPath = req.files.file.path;

		if (path.extname(req.files.file.name).toLowerCase() === '.jpg') {
			var fileName = md5(req.files.file.path + req.user.user_id);
			var targetPath = path.resolve('./images/travel/full/' + fileName);
			fs.rename(tempPath, targetPath, function(err) {
				if (err){
					// throw err; ошибка
					res.status(400);
					return res.send({error: "error save file"});
				}

				var thumbnailPath = path.resolve('./images/travel/thumbnail/' + fileName);
				Jimp.read(targetPath, function (err, image) {
					image.resize(config.get("image:thumbnail:width"), config.get("image:thumbnail:height"))            // resize
						.quality(config.get("image:thumbnail:quality"))                 // set JPEG quality
						//.greyscale()                 // set greyscale
						.write(thumbnailPath); // save
					res.status(201);
					return res.send({name: fileName});

				});


			});
		} else {
			fs.unlink(tempPath, function () {
				log.error("Only .png files are allowed!");
				if (err){
					res.status(500);
					return res.send({error: "error file system"});
				}
			});
		}
	});

/**
 * я такой жадный что без авторизации картинки вы тоже не получите)
 */
router.get('/:type/:size/:imageName', passport.authenticate('bearer', {session: false}),
	function (req, res) {
		log.debug('отдаем файл');

		var type = '';
		switch (req.params.type){
			case 'u':
				type = 'avatar';
				break;
			case 'p':
				type = 'travel';
				break;
			default:
				return res.sendStatus(400);
		}

		var size = '';
		switch (req.params.size){
			case 'f':
				type = 'full';
				break;
			case 't':
				type = 'thumbnail';
				break;
			default:
				return res.sendStatus(400);
		}

		// пытаемся отдать файлик
		res.sendfile(path.resolve('./images/' + type + '/' + size + '/' + req.params.imageName));
	});

/**
 * отдельный метод для сохранения аватарок
 * почему отдельный, потому что старую картинку придется удалить если она была!
 */
router.post('/avatar', passport.authenticate('bearer', {session: false}),
	function (req, res) {

		log.debug('попытка сохранить/изменить аватар пользователя = ' + req.user.user_id);




		return res.sendStatus(201);

	});

module.exports = router;