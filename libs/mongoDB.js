var mongoose = require('mongoose');
var log = require('./log')(module);
var config = require('./config');

mongoose.connect(config.get('mongoose:main'));

var db = mongoose.connection;

db.on('error', function (err) {
	log.error('connection error:', err.message);
	throw err;
});
db.once('open', function callback() {
	log.info("Connected to DB!");

});

module.exports = mongoose;
