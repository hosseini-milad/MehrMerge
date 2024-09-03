const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema({
  title: { type: String},
  url:{type: String},
  shortDesc: { type: String},
  description: { type: String},
  meta:{type: String},
  imageUrl: String,
});

module.exports = mongoose.model("pages", pageSchema);