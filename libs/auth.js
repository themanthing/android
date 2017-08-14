var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var log = require('./log')(module);
var config = require('./config');

var User = require('../model/user');
var Client = require('../model/client');
var AccessToken = require('../model/accessToken');
var RefreshToken = require('../model/refreshToken');

passport.use(new BasicStrategy(
	function(username, password, done) {
		Client.findOne({ clientId: username }, function(err, client) {
			if (err) {
				log.debug('не удалось найти клиента с id = ' + username);
				return done(err);
			}

			if (!client) {
				log.debug('не удалось найти клиента с id = ' + username);
				return done(null, false);
			}

			if (client.clientSecret !== password) {
				log.debug('Кривой паролик');
				return done(null, false);
			}
			log.debug('Клиент найден');
			return done(null, client);
		});
	}
));

passport.use(new ClientPasswordStrategy(
	function(clientId, clientSecret, done) {
		Client.findOne({ clientId: clientId }, function(err, client) {
			if (err) {
				log.debug('не удалось найти клиента с id = ' + clientId);
				return done(err);
			}

			if (!client) {
				log.debug('не удалось найти клиента с id = ' + clientId);
				return done(null, false);
			}

			if (client.clientSecret !== clientSecret) {
				log.debug('пароль не подошол = ' + clientId);
				return done(null, false);
			}
			log.debug('Успешно все подключили');
			return done(null, client);
		});
	}
));

passport.use(new BearerStrategy(
	function(accessToken, done) {
		AccessToken.findOne({ token: accessToken }, function(err, token) {

			if (err) {
				return done(err);
			}

			if (!token) {
				return done(null, false);
			}

			if( Math.round((Date.now()-token.created)/1000) > config.get('security:tokenLife') ) {

				AccessToken.remove({ token: accessToken }, function (err) {
					if (err) {
						return done(err);
					}
				});

				return done(null, false, { message: 'Token expired' });
			}

			User.findById(token.userId, function(err, user) {

				if (err) {
					return done(err);
				}

				if (!user) {
					return done(null, false, { message: 'Unknown user' });
				}

				var info = { scope: '*' };
				done(null, user, info);
			});
		});
	}
));