const mongoose = require("mongoose");

const lenzStockSchema = new mongoose.Schema({
  brandName: {type: String},
  lenzIndex: { type: String },
  material: { type: String },
  coating: { type: String },
  design: { type: String },

  sku:{ type: String , unique: true},

  od: { type: String },
  sphOD:{ type: String },
  cylOD:{ type: String },
  axisOD:{ type: String },
  addOD:{ type: String },
  os: { type: String },
  sphOS:{ type: String },
  cylOS:{ type: String },
  axisOS:{ type: String },
  addOS:{ type: String },

  priceOS: { type: String },
  discountOS:{ type: String },

  priceOD: { type: String },
  discountOD:{ type: String },
});

module.exports = mongoose.model("stocks", lenzStockSchema);