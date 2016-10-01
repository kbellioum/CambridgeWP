var mongoose = require('mongoose');

module.exports = mongoose.model('Inventory',{
  nameinventory: String,
  depotname: String,
	dateinventory: String,
	detail: [{
              prodid: String,
              prodcode: String,
              prodname: String,
              qtetheory:Number,
              qteinventory: Number
          }]
});
