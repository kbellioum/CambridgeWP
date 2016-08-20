var mongoose = require('mongoose');

module.exports = mongoose.model('Counter',{
	  counter: { type: Number, default: 00 },
    name: String
});
