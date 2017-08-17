// картинки
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Images = new Schema({
	kind: {
		type: String,
		enum: ['thumbnail', 'full'],
		required: true
	},
	url: {
		type: String,
		required: true
	}
});

module.exports.Schema = Images;
module.exports.Model = mongoose.model('Images', Images);
