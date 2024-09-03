const mongoose = require('mongoose');

const XtraSchema = new mongoose.Schema({
    title:  String,
    colorCode:String,
    colorPrice:String,
    sort:String,
    imageUrl: String
})
module.exports = mongoose.model('xtra',XtraSchema);