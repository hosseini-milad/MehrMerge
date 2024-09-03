const mongoose = require("mongoose");

const PayLogSchema = new mongoose.Schema({
  userId:{type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  stockOrderNo: {type: String},
  orderNoInt:{type:String},
  payStatus: {type: String},
  stockOrderPrice: {type: String},
  saleReferenceId:{type: String},
  errorMessage:{type: String},
  errorCode:{type: String},
  terminalId:{type: String},
  query:{type: Object},
  payDate:{ type: Date,default:Date.now()}
});

module.exports = mongoose.model("paylog", PayLogSchema);