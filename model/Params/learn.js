const mongoose = require("mongoose");

const learnSchema = new mongoose.Schema({
  title: { type: String},
  enTitle:{type:String,unique:true},
  content: { type: String},
  abstract: { type: String},
  feature: { type: Boolean,default:false},
  link:{type:String, default:"#"},
  imageUrl: { type: String},
  uploadUrl: { type: String},
  videoUrl: { type: String},
  iconUrl:{ type: String}
}); 

module.exports = mongoose.model("learn", learnSchema);