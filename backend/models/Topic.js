const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  key: { type: String, required: true },
  background: { type: String, required: false, default: "" },
  notes: {
    data: Buffer, // for binary PDF/doc files
    contentType: String, // e.g. 'application/pdf'
    filename: String
  }, // filename or file url
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'RegisterRequest' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'RegisterRequest' },
  views: { type: Number, default: 0 }
});
topicSchema.index({ createdAt: -1 });
module.exports = mongoose.model('Topic', topicSchema);
