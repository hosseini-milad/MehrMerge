const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    title:  String,
    enTitle:  String,
    sort:  Number,
    paymentCode:String
})
module.exports = mongoose.model('payment',PaymentSchema);