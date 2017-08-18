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
var ImageModel = require('../model/images').Model;

/**
 * сохранение картинок
 * картинки я буду складыватьт в папочку по {userId}/travel/{date}/id.jpg
 * пока что поддерживает загрузку ТОЛЬКО jpg остальное спасибо не надо)
 */
router.post('/', passport.authenticate('bearer', {session: false}),
	function (req, res) {
		log.debug('получаем файл');
		var tempPath = req.files.file.path;

		if (path.extname(req.files.file.name).toLowerCase() === '.jpg') {
			var fileName = md5(req.files.file.path + req.user.userId);
			var targetPath = path.resolve('./images/travel/full/' + fileName);
			fs.rename(tempPath, targetPath, function (err) {
				if (err) {
					// throw err; ошибка
					res.status(400);
					return res.send({error: "error save file"});
				}

				var thumbnailPath = path.resolve('./images/travel/thumbnail/' + fileName);
				Jimp.read(targetPath, function (err, image) {
					image.resize(config.get("image:thumbnail:width"), config.get("image:thumbnail:height"))
						.quality(config.get("image:thumbnail:quality"))
						.write(thumbnailPath);
					res.status(201);
					return res.send({name: fileName});

				});


			});
		} else {
			fs.unlink(tempPath, function () {
				log.error("Only .png files are allowed!");
				if (err) {
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
		switch (req.params.type) {
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
		switch (req.params.size) {
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

		log.debug('попытка сохранить/изменить аватар пользователя = ' + req.user.userId);

		PeopleModel.findOne({userId: req.user.userId}, function (err, people) {

			// то что пользователя нет это ошибка...

			if (saveImage(req.file, req.user.userId, 'avatar')) {
				var newAvatar = new ImageModel({
					kind: "full",
					url: req.user.userId
				});

				people.avatar = newAvatar;
				people.save(function (err) {

					if (!err) {
						return res.sendStatus(201);
					}else{
						res.status(500);
						return res.status({error: "Internal error"})
					}

				});

			}else{
				// ошибка сохранения файла!
				res.status(500);
				return res.send({error: "Internal error"})
			}


		});


	});

function saveImage(file, userid, type) {

	if (path.extname(file).toLowerCase() === '.jpg') {
		var fileName = md5(file.path + userid);
		if ("avatar" == type) {
			fileName = userid;
		}
		var targetPath = path.resolve('./images/' + type + '/full/' + fileName);
		fs.rename(file.path, targetPath, function (err) {
			if (err) {
				throw new Error('save error');
			}

			var thumbnailPath = path.resolve('./images/' + type + '/thumbnail/' + fileName);
			Jimp.read(targetPath, function (err, image) {
				image.resize(config.get("image:thumbnail:width"), config.get("image:thumbnail:height"))
					.quality(config.get("image:thumbnail:quality"))
					.write(thumbnailPath);
				return true;
			});

		});
	} else {
		fs.unlink(file.path, function () {
			log.error("Only .jpg files are allowed!");
			if (err) {
				throw new Error("Only .jpg files are allowed!");
			}
			return false;
		});
	}

}

module.exports = router;