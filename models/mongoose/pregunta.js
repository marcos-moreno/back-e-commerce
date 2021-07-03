const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const pregunta = new Schema({
  numeropregunta: {type: Number, required: true, unique: true},
  pregunta: {type: String, required: true, max: 1000}, 
  descripcion: {type: String, required: true, max: 1000}, 
  estado: {type: String, required: true, max: 50}, 
  created_at: {type:Date,required: true,default:Date.now},
  created_by : {type: String, required: true, max: 20,trim: true},
  nombre_usuarios: {type: String, required: true, max: 200,trim: true},

});

const Pregunta = mongoose.model('Pregunta', pregunta);
module.exports = Pregunta;