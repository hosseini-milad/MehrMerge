const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema({
  userId: {type: String},
  offerCode: {type: String},
  brandName: {type: String},
  category:{type: String},

  firstPurchase:{type: String},
  cachBack:{type: String},
  

  discountValue:{type: String},
  discountPercent:{type: String},
  minPrice: { type: String },
  maxDiscount: { type: String },
  
  sku:{ type: String},

  discountTimeFrom: { type: String },
  discountTimeTo:{ type: String },
  date:{ type: Date },

});

module.exports = mongoose.model("offers", OfferSchema);