const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sequensML =  new Schema({
  nombre: {type: String, required: true},
  value: { type: Number, default: 0 }
});

const sequens = mongoose.model('sequens', sequensML);
module.exports = sequens;