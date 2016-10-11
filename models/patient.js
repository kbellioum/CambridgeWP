
var mongoose = require('mongoose');

module.exports = mongoose.model('Patient',{
	patientnom: String,
	patientprenom: String,
	email: String,
	ville: String,
	alergies: String,
	tailleinit: { type: Number, default: 00 },
	poidinit: { type: Number, default: 00 },
	bmiinit: { type: Number, default: 00 },
	occupation: String,
	telephone: String,
	textarea: String,
	cin: String,
	dob: String,
	statu: String,
	numdossier: String,
	question1: String,
	question2: String,
	question3: String,
	visites: [
		        {
							daterdv: String,
							poid: Number,
							taille: Number,
							bmi: Number,
							prog: String,
							prix: Number,
							descprod: String,
							nextrdv: String,
							comment: String,
							consultant: String,
							clotured: Boolean,
							factnum: String,
							discount: {type: Number, default: 0},
							products:[{
								prodcode: String,
								prodname: String,
								prodqte: Number
								}]
						}
	]
});
