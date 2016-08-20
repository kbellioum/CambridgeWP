var mongoose = require('mongoose');

module.exports = mongoose.model('Prog',{
	nom: String,
	products: [
        {
          codeproduit: String,
          prixproduit: Number,
          nomproduit: String,
          qte: Number
        }
  ],
  prix: Number
});
