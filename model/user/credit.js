const mongoose = require("mongoose");

const CreditSchema = new mongoose.Schema({
  phone: { type: String},
  credit: { type: String}
});

module.exports = mongoose.model("credit", CreditSchema);