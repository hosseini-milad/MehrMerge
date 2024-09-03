const mongoose = require("mongoose");

const mgminfoSchema = new mongoose.Schema({
  shopCode: { type: String},
  shopTitle: { type: String},
  address:{type: String},
  phone: { type: String},
  email: { type: String},
  fax:{type: String},
  instagram: { type: String},
  telegram: { type: String},
  whatsapp:{type: String},
  eitaa :{type: String}
});

module.exports = mongoose.model("mgminfo", mgminfoSchema);