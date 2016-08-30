var mongoose = require('mongoose');

module.exports = mongoose.model('Product',{
  prodcode: String,
  prodname: String,
  extra: Boolean,
  qtemin: Number
});
