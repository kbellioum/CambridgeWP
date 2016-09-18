var mongoose = require('mongoose');

module.exports = mongoose.model('inout',{
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
    Fournisseur: String,
    numbc: String,
    numbl: String,
    motifin: String,
    out: [{
      qteout: Number,
      motifout: String,
      dateout: String
    }]
});
