const mongoose = require('mongoose');

const TransferSchema = new mongoose.Schema({
    title:  String,
    enTitle:  String,
    sort:  Number,
    transCode:String
})
module.exports = mongoose.model('transfer',TransferSchema);