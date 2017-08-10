var winston = require('winston');
require('winston-daily-rotate-file');

function getLogger(module) {
	var path = module.filename.split('/').slice(-2).join('/'); //отобразим метку с именем файла, который выводит сообщение

	return new winston.Logger({
		transports : [
			new winston.transports.Console({
				colorize:   true,
				level:      'debug',
				label:      path
			}),
			new winston.transports.DailyRotateFile({
				filename: './log/nexi-timmer.log',
				datePattern: 'yyyy-MM-dd.',
				prepend: true,
				level: process.env.ENV === 'development' ? 'debug' : 'info'
			})
		]
	});
}

module.exports = getLogger;