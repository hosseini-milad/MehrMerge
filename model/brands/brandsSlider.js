const mongoose = require('mongoose');

const BrandSliderSchema = new mongoose.Schema({
    title:  String,
    description:   String,
    imageUrl: String,
    brand:{type: mongoose.Schema.Types.ObjectId, ref: 'brands'},
    color:String,
    date: { type: Date, default: Date.now },
    slogon:String,
})
module.exports = mongoose.model('brandSliders',BrandSliderSchema);