const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const userSchema = new Schema({
//   name: String,
//   email: {
//     unique: true,
//     type: String
//   },
//   password: String,
// }) 

const userSchema = new mongoose.Schema({
  name: {type: String, required: true, max: 100},
  lastname: {type: String, required: true, max: 100},
  mlastname: {type: String, required: true, max: 100}, 
  password: {type: String, required: true, max: 100},
  email: {type: String, required: false, max: 100, unique: true,trim: true},
  isActive: {type: Boolean, required: true,trim: true, default: true }, 
  created_at: { type: Date, default: Date.now }, 
  last_acces: { type: Date, default: Date.now },
  type_user: { type: String, default: 'user' }
}); 

const User = mongoose.model('User', userSchema);
module.exports = User;