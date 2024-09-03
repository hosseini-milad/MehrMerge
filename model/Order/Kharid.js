const mongoose = require("mongoose");

const KharidSchema = new mongoose.Schema({
  rxLenz: { type: String },
  rxCount:{ type: String },
  rxOrderNo:{type: String},
  rxFaktorNo:{type: String},
  rxFaktorName:{type: String},
 
  date:{ type: Date },
});

module.exports = mongoose.model("kharid", KharidSchema);