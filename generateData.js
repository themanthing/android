var faker = require('faker');

var model = process.cwd() + '/model/';

var log = require('./libs/log')(module);
var db = require('./libs/mongoDB');
var config = require('./libs/config');

var User = require(model + 'user');
var Client = require(model + 'client');
var AccessToken = require(model + 'accessToken');
var RefreshToken = require(model + 'refreshToken');

User.remove({}, function(err) {
	var user = new User({
		username: config.get("default:user:username"),
		password: config.get("default:user:password"),
		auth_via: "native"
	});

	user.save(function(err, user) {
		if(!err) {
			log.info("New user - %s:%s", user.username, user.password);
		}else {
			return log.error(err);
		}
	});
});

Client.remove({}, function(err) {
	var client = new Client({
		name: config.get("default:client:name"),
		clientId: config.get("default:client:clientId"),
		clientSecret: config.get("default:client:clientSecret")
	});

	client.save(function(err, client) {

		if(!err) {
			log.info("New client - %s:%s", client.clientId, client.clientSecret);
		} else {
			return log.error(err);
		}

	});
});


AccessToken.remove({}, function (err) {
	if (err) {
		return log.error(err);
	}
});

RefreshToken.remove({}, function (err) {
	if (err) {
		return log.error(err);
	}
});

setTimeout(function() {
	db.disconnect();
}, 3000);