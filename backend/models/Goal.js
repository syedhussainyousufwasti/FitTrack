const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title:    { type: String, required: true },
  target:   String,
  deadline: Date,
  progress: { type: Number, default: 0, min: 0, max: 100 },
  achieved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Goal', GoalSchema);