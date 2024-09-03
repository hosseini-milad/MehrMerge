const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, default: null },
  enTitle: { type: String, default: null },
  parent: {type: mongoose.Schema.Types.ObjectId, ref: 'job'},
});

module.exports = mongoose.model("job", jobSchema);