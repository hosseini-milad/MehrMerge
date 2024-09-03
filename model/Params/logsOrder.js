const mongoose = require("mongoose");

const orderLogSchema = new mongoose.Schema({
  status: { type: String},
  rxOrderNo:{ type: String},
  date:{ type: Date },
  user:{type:String}
});

module.exports = mongoose.model("orderlog", orderLogSchema);