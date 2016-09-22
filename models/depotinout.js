var mongoose = require('mongoose');

module.exports = mongoose.model('Depotinout',{

  depotname: String,
  prodid: String,
  prodcode: String,
  prodname: String,
  prodqteinit: Number,
  prodqtemv: Number,
  produnite: String,
  datein: String,
  dateexp: String,
  dateachat: String,
  prixachat: Number,
  prixvente: Number,
  fournisseur: String,
  numbc: String,
  numbl: String,
  motifin: String,
  out: [{
    qteout: Number,
    dateout: String,
    motifout: String
  }]

});
