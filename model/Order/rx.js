const mongoose = require("mongoose");

const RXSchema = new mongoose.Schema({
  userId:{type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  consumer: {type: String},
  manageId: {type: String},
  rxLenz: { type: String },
  rxOrderNo:{type: String},
  rxFaktorNo:{type: String},
  brand:{type:String},
  lastIndex:{type:Number, default:0},
  lenzDid:{type: String},
  
  odMain: { type: String },
  odMore: { type: String },

  osMain: { type: String },
  osMore: { type: String },
  
  copyLeftRight:{type:Number},
  singleLens:{type:Number},

  frameSize:{ type: String },
  frameType:{ type: String },
  frameImg:{ type: String },

  colorCode:{ type: String },
  colorPrice:{ type: String },

  coverCode:{ type: String },
  coverPrice:{ type: String },
  coridor:{ type: String },

  mirrorCode:{ type: String },
  mirrorPrice:{ type: String },

  lanti:{ type: String },
  NazokTigh:{type: String },
  NazokTighPrice:{type: String },
  extraInformation: { type: String },

  viewValue:{type: String},
  studyDistance:{type: String},
  job:{type: String},
  moreInformation:{type: String},
  expressPrice:{type: String},

  extraPrice:{ type: String },
  lenzPrice:{ type: String },
  totalDiscount:{ type: String },
  totalPrice:{ type: String },
  
  status:{ type: String },
  date:{ type: Date },
  progressDate:{ type: Date },
});

module.exports = mongoose.model("rx", RXSchema);