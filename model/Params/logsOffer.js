const mongoose = require("mongoose");

const offerLogSchema = new mongoose.Schema({
  userId: { type: String},
  brandName:{ type: String},
  date:{ type: Date },
  discountPercent :{type:String}
});

module.exports = mongoose.model("offerlog", offerLogSchema);