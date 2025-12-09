const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  createdAt: { type: Date, default: Date.now },
  data: mongoose.Schema.Types.Mixed // store matches / score / answers
});

module.exports = mongoose.model('Result', resultSchema);
