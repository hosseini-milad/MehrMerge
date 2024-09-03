const mongoose = require("mongoose");

const docSchema = new mongoose.Schema({
  title: { type: String},
  url:{ type: String},
  content:{ type: String},
  kind: { type: String},
  category: { type: Object},
  parameters: { type: Array},
  request: { type: String},
  response: { type: String},
  index:{ type: String}
});

module.exports = mongoose.model("document", docSchema);