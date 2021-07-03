const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const queja = new Schema({
  numero_queja: {type: Number, required: true, unique: true},
  tema: {type: String, required: true, max: 1000}, 
  descripcion: {type: String, required: true, max: 1000}, 
  estado: {type: String, required: true, max: 50},
  created_at: {type:Date,required: true,default:Date.now},
  created_by : {type: String, required: true, max: 20,trim: true},
  nombre_usuario: {type: String, required: true, max: 200,trim: true},

});

const Queja = mongoose.model('Queja', queja);
module.exports = Queja;