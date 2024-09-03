const mongoose = require("mongoose");
 
const CartSchema = new mongoose.Schema({
  userId: { type: String },
  title:{ type: String },
  sku:{ type: String },
  weight:{type: Number},
  count:{type: Number},
  freePrice:{type: Number},
  price:{type: Number},
    
  date:{ type: Date ,default:Date.now()},
});

module.exports = mongoose.model("cart", CartSchema);