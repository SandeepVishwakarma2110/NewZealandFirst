const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  key: { type: String, required: true },
  background: { type: String, required: true },
  notes: { type: String }, // filename or file url
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'RegisterRequest' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'RegisterRequest' },
  views: { type: Number, default: 0 }
});

module.exports = mongoose.model('Topic', topicSchema);
