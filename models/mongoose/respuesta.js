const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const respuesta = new Schema({
  numeropregunta: {type: Number, required: true},
  respuesta: {type: String, required: true, max: 1000}, 
  activo: {type: Boolean, required: true}, 
  calificacion: {type: Number, required: true}, 
  created_at: {type:Date,required: true,default:Date.now},
  created_by : {type: String, required: true, max: 20,trim: true},
  nombre_usuarios: {type: String, required: true, max: 200,trim: true},

});

const Respuesta = mongoose.model('Respuesta', respuesta);
module.exports = Respuesta;