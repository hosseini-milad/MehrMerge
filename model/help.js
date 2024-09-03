const mongoose = require("mongoose");

const helpSchema = new mongoose.Schema({
  title: { type: String},
  description: { type: String},
  imageUrl: String,
});

module.exports = mongoose.model("help", helpSchema);