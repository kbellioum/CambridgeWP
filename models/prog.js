var mongoose = require('mongoose');

module.exports = mongoose.model('Prog',{
	nom: String,
	products: [
        {
          codeproduit: String,
					nomproduit: String,
          prixproduit: Number,
          qte: Number
        }
  ],
  prix: Number
});
