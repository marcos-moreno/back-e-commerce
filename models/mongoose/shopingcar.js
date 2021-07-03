const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const shopingcar = new Schema({
  value: {type: String, required: true, max: 20},
  ad_user_id: {type: String, required: true, max: 20}, 
  cantidad: {type: Number, required: true}, 
});

const Shopingcar = mongoose.model('Shopingcar', shopingcar);
module.exports = Shopingcar;