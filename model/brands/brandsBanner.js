const mongoose = require('mongoose');

const BrandBannerSchema = new mongoose.Schema({
    title:  String,
    description:   String,
    imageUrl: String,
    brand:{type: mongoose.Schema.Types.ObjectId, ref: 'brands'},
    date: { type: Date, default: Date.now },
    slogon:String,
})
module.exports = mongoose.model('brandBanner',BrandBannerSchema);