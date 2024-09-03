const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    title:  String,
    category:String,
    serviceCode:String,
    servicePrice:String,
    serviceUnit:String,
    servicePurchase:String,
    options:String,
    sort:String,
    imageUrl: String
})
module.exports = mongoose.model('services',ServiceSchema);