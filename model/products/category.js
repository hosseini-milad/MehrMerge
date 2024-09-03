const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    title:  String, // String is shorthand for {type: String}
    catId: String,
    catCode:String,
    parent: String,
    body:   String,
    description:String,
    fullDesc: String,
    color: String,
    imageUrl: String,
    brands:{type:Array,default:[]},
    date: { type: Date, default: Date.now }
})
module.exports = mongoose.model('categories',CategorySchema);