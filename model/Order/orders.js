const mongoose = require("mongoose");

const OrdersSchema = new mongoose.Schema({
  userId:{type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  stockId: {type: String},
  payStatus: {type: String},
  manageId: {type: String},
  group: { type: String },
  stockOrderNo:{type:String},
  carNo: { type: String },
  ghabzIn:{ type: String },
  ghabzOut:{ type: String },
  cert:{ type: String },

  stockOrderPrice:{type:String},
  credit:{type:String},
  freeCredit:{type:String},
  stockFaktor:[{type:Object}],
  stockFaktorOrg:[{type:Object}],
  status:{ type: String },
  description:{ type: String },
  date:{ type: Date }, 
  loadDate:{ type: Date },
  loadDateOrg:{ type: Date },
  inDate:{ type: Date },
  outDate:{ type: Date },
  progressDate:{ type: Date },
});

module.exports = mongoose.model("orders", OrdersSchema);