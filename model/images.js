// картинки
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Images = new Schema({
	kind: {
		type: String,
		enum: ['thumbnail', 'detail'],
		required: true
	},
	url: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Images', Images);
