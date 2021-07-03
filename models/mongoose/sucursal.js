const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const rutas = new Schema({ 
  numero_ruta: {type: Number, required: true},
  dia_prepara: {type: Number, required: true},
  dia_salida: {type: Number, required: true},
  dia_llegada: {type: Number, required: true},
  hr_max: {type: Number, required: true},
});

const sucursal = new Schema({
  rutas : [rutas],
  value: {type: String, required: true, max: 20},
  ad_org_id: {type: String, required: true, max: 20,unique: true}, 
  name: {type: String, required: true, max: 100}, 
  url_maps: {type: String, required: true, max: 10000}, 
  isactive: {type: String, required: true, max: 1}, 
  isruta: {type: Boolean, required: true},  
});



const Sucursal = mongoose.model('Sucursal', sucursal);
module.exports = Sucursal;