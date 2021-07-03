const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const queja_respuesta = new Schema({
  numero_queja: {type: Number, required: true},
  respuesta: {type: String, required: true, max: 1000}, 
  activo: {type: Boolean, required: true}, 
  created_at: {type:Date,required: true,default:Date.now},
  created_by : {type: String, required: true, max: 20,trim: true},
  nombre_usuario: {type: String, required: true, max: 200,trim: true},

});

const QuejaRespuesta = mongoose.model('QuejaRespuesta', queja_respuesta);
module.exports = QuejaRespuesta;