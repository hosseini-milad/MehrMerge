const mongoose = require("mongoose");

const paramSchema = new mongoose.Schema({
  title: { type: String},
  paramValue: { type: String},
  paramNegative: { type: String}
});

module.exports = mongoose.model("params", paramSchema);