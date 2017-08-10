var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var log = require('./libs/log')(module);
var index = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/users');
var travels = require('./routes/travels');
var messages = require('./routes/users');
var registration = require('./routes/registration');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//app.use(cookieParser()); нам не нужны куки
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', index);
// авторизация проверка токена и т.д.
app.use('/auth', auth);
// регистрация пользователя
app.use('/registration', registration);

/**
 * все запросы на /api должны идти через token
 */

// список пользователей (люди)
app.use('/api/users', users);
// список путешествий (путешествия)
app.use('/api/travels', travels);
// список сообщеий
app.use('/api/messages', messages);

/**
 * проверяем токен к header если он нужен
 * ну и конечно же проверяет его
 */
app.use(function (req, res, next) {
	log.debug('request URL: %s',req.url);
	if (req.url.indexOf('/api') !== -1){
		if (!req.headers.token) {
			log.debug('кто-то нехороший пришол без токена!')
		}else{
			// вилидируем токен
		}

		res.statusCode = 403;
		return res.send({error: 'token required'});
	}
	next();
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
	log.debug('Not found URL: %s',req.url);
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	// TODO убрать потом
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	log.error('Internal error(%d): %s',res.statusCode,err.message);

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});


module.exports = app;
