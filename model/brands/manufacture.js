const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const ManufactureStateSchema = new Schema({
    title:  String,
    enTitle:String,
    state:{
        type:String,
        enum:["فعال","غیرفعال"]
    }
    
})
module.exports = mongoose.model('manstate',ManufactureStateSchema);