const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  id: String,          // e.g. "skill-1" or "personality"
  title: String,
  type: String,        // 'skill' or 'personality'
  questions: [
    {
      id: String,
      text: String,
      choices: [{ id: String, text: String, score: Number }]
    }
  ]
});

module.exports = mongoose.model('Test', testSchema);
