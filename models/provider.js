
var mongoose = require('mongoose');

module.exports = mongoose.model('Provider',{
	raisonsociale: String,
	telephone: String,
	fax: String,
	mail: String,
	adresse: String,
	site: String,
	autre: String

});
