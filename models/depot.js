var mongoose = require('mongoose');

module.exports = mongoose.model('Depot',{
  depotname: String,
  inout: [
    {
    prodid: String,
    prodcode: String,
    prodqte: Number,
    produnite: String,
    datein: String,
    dateexp: String
    dateachat: String,
    prixachat: Number,
    prixvente: Number,
    Fournisseur: String,
    numbc: String,
    numbl: String
  }
  ]
});
