const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const req_change_pass = new Schema({  
  code: {type: String, required: true, max: 6,trim: true}, 
  ad_user_id: {type: String, required: true, max: 20,trim: true}, 
  creado : {type:Date,required: true, default:Date.now}, 
  expira : {type:Date,required: true}, 
  activo : {type: Boolean, required: true},   
});

const Req_change_pass = mongoose.model('Req_change_pass', req_change_pass);
module.exports = Req_change_pass;