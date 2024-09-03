const mongoose = require('mongoose');

const MirrorSchema = new mongoose.Schema({
    title:  String,
    colorCode:String,
    colorPrice:String,
    sort:String,
    imageUrl: String
})
module.exports = mongoose.model('mirror',MirrorSchema);