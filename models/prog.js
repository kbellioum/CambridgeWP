var mongoose = require('mongoose');

module.exports = mongoose.model('Prog',{
	progname: String,
	products: [
        {
          prodcode: String,
					prodname: String,
          prodprice: Number,
          prodqte: Number,
					prodexpdate: String
        }
  ],
  progprice: Number,
	maxunite: Number
});
