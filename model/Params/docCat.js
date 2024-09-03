const mongoose = require("mongoose");

const docCatSchema = new mongoose.Schema({
  title: { type: String},
  id:{type:Number},
  enTitle: { type: String},
  content: { type: String},
  prior:{type:Number}
});

module.exports = mongoose.model("docCat", docCatSchema);