var mongoose = require('mongoose');

module.exports = mongoose.model('Depotinout',{

  depotname: String,
  prodid: String,
  prodcode: String,
  prodname: String,
  prodqteinit: {type: Number, min:0},
  prodqtemv: {type: Number, min:0},
  produnite: String,
  datein: String,// {type: Date, default: Date.now},
  dateexp: String,
  dateachat: String,//Date,
  prixachat: Number,
  prixvente: Number,
  fournisseur: String,
  numbc: String,
  numbl: String,
  motifin: String,
  out: [{
    qteout: {type: Number, min:0},
    dateout: String,
    motifout: String,
    factnum:String
  }]

});
