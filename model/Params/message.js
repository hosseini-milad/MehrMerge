const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  title: { type: String},
  cat:{type:String},
  content: { type: String},
  userId: { type: String},
  orderNo:{ type: String},
  
  status: { type: String},
  date:{type:Date,default:Date.now()}
}); 

module.exports = mongoose.model("message", messageSchema);