const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  phone: { type: String, unique: true },
  cName: { type: String},
  cCode:{ type: String},
  password: { type: String },
  email: { type: String },
  access:{
    type:String, 
    enum:["manager","factory","store","customer","shop","request"]
  },
  group: {
    type:String,
    enum:["groupA","groupB","groupC","groupD"]
  },
  credit: { type: String },
  token: { type: String },
  otp:{ type: String , default: null },
  sex: { type: String },
  mahiat: { type: String },
  activity: { type: String },
  phone1: { type: String },
  phone2: { type: String },
  phone3: { type: String },
  fax: { type: String }
});

module.exports = mongoose.model("customer", customerSchema);