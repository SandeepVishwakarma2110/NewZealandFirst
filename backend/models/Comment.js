const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'RegisterRequest', required: true },
  text: { type: String, required: true },
  replies: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'RegisterRequest' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Comment', commentSchema);
