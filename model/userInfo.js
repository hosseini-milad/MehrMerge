const mongoose = require("mongoose");

const userInfoSchema = new mongoose.Schema({
  userName: { type: String, default: null },
  meliCode: { type: String , default: null },
  phone: { type: String , default: null },
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  mobile: { type: String },
  email: { type: String },
  birthDate: { type: String },
  hesab:{ type: String },
  job: {type: String},
});

module.exports = mongoose.model("userInfo", userInfoSchema);