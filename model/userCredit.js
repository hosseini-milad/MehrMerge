const mongoose = require("mongoose");

const userCreditSchema = new mongoose.Schema({
  userId: { type: String },
  
  creditValue: { type: String },
  creditTime: { type: String },
  creditDesc: { type: String },
  
});

module.exports = mongoose.model("usercredit", userCreditSchema);