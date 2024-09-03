const mongoose = require("mongoose");

const userAddressSchema = new mongoose.Schema({
  phone: { type: Number },
  userId:{ type: String },
  addressUserName: { type: String },
  address:{ type: String },
  state: { type: String },
  city: { type: String },
  addressPhone:{ type: String },
  postalCode:{ type: String },
  location:{ type: String },
});

module.exports = mongoose.model("userAddress", userAddressSchema);