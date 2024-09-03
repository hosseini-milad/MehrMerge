const mongoose = require('mongoose');

const ColorSchema = new mongoose.Schema({
    title:  String,
    colorCode:String,
    colorPrice:String,
    sort:String,
    imageUrl: String
})
module.exports = mongoose.model('color',ColorSchema);