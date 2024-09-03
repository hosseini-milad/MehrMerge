const mongoose = require('mongoose');

const AdvSchema = new mongoose.Schema({
    title:  String,
    advCode:String,
    description:   String,
    url: String,
    imageUrl: String,
    thumbUrl: String,
    category:String,

    date: { type: Date, default: Date.now }
    
})
module.exports = mongoose.model('adv',AdvSchema);