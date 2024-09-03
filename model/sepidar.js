const mongoose = require("mongoose");

const sepidarSchema = new mongoose.Schema({
  token: { type: String},
  modulus:{ type: String},
  exponent: { type: String },
  registerCode: { type: String , unique: true}  
});

module.exports = mongoose.model("sepidar", sepidarSchema);