var mongoose = require('mongoose');

module.exports = mongoose.model('Events',{
	id: String,
	title: String,
	start: String,
	end: String,
	phone: String,
	allDay: Boolean,
	isPatient: Boolean,
	color: String
});
