const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');

const tipoSolicitante = new Schema({ 
  tipo: {type: String, required: true, max: 200,trim: true},
  razonSocial: {type: String, required: false, max: 1000,trim: true,uppercase: true},
  personaReferencia: {type: String, required: false, max: 100,trim: true,uppercase: true}, 
  celularReferencia: {type: String, required: false, max: 20,trim: true},
  parentezcoReferencia: {type: String, required: false, max: 200,trim: true,uppercase: true},
  rfcColborador : {type: String, required: false, max: 13, trim: true,uppercase: true},
});

const resultsCreateUS = new Schema({ 
  cbpartner: {type:Object,required: false},
  cbpartnerlocation: {type:Object,required: false},
  aduser: {type:Object,required: false}, 
  lmx_bpartner: {type:Object,required: false}, 
}); 

const pre_registro = new Schema({  
  tipoSolicitante : [tipoSolicitante],
  nombreSolicitante: {type: String, required: false, max: 200,trim: true,uppercase: true}, 
  numeroCelular: {type: String, unique: true, required: true, max: 20,trim: true},
  email: { type: String, index: true, unique: true, required: true, uniqueCaseInsensitive: true,lowercase:true },
  requiredFactura : {type: Boolean, required: true},
  direccion: {type: String, required: false, max: 1000,trim: true,uppercase: true},
  UsoCFDI: {type: String, required: false, max: 20,trim: true}, 
  created_at: {type:Date,required: true,default:Date.now},
  folio:{type: Number, required: true,default: 0,unique: true},
  resultAD : {type:Object,required: false},
  estado_solicitud: {type: String, required: true, max: 20,trim: true,uppercase: true},
  c_bpartner_id: {type: String, required: false, max: 20,trim: true}, 
  ad_user_id: {type: String, required: false, max: 20,trim: true},
  c_bpartner_location_id : {type: String, required: false, max: 20,trim: true},

  syncAD_at: {type:Date,required: false},
  cp:{type: String, required: false, max: 5,trim: true}, 
  estado:{type: String, required: false, max: 200,trim: true}, 
  ciudad:{type: String, required: false, max: 200,trim: true}, 
  municipio:{type: String, required: false, max: 200,trim: true}, 
  pais:{type: String, required: false, max: 200,trim: true}, 
  asentamiento :{type: String, required: false, max: 200,trim: true}, 
  montPreAprobed :{type: Number,default: 0}, 
  resultADWS : [resultsCreateUS], 
  st_sendemail:{type:Object,required: false},
});
 


pre_registro.plugin(uniqueValidator);
const Pre_registro = mongoose.model('Pre_registro', pre_registro);
module.exports = Pre_registro;
 