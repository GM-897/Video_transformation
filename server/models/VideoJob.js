const mongoose = require('mongoose');

const videoJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      // ref: 'User',
      type: String,
      required: true,
      // index: true // Speeds up queries for user history
    },
    // sourceUrl: {
    //   type: String,
    //   required: true
    // },
    transformedUrl: {
      type: String
    },
    parameters: {
      type: mongoose.Schema.Types.Mixed, 
      default: {}
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
      index: true
    },
    falRequestId: {
      type: String,
      required: false
    },
    logs: [
      {
        timestamp: { type: Date, default: Date.now },
        message: { type: String }
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// videoJobSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('VideoJob', videoJobSchema);
