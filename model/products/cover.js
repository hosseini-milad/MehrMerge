const mongoose = require('mongoose');

const CoverSchema = new mongoose.Schema({
    option:  String,
    content:String,
    brand:String,
    sort:Number,
    price:String
})
module.exports = mongoose.model('cover',CoverSchema);