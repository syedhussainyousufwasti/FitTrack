const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  exercise:    { type: String, required: true },
  muscleGroup: String,
  sets:        Number,
  reps:        Number,
  weight:      Number,
  notes:       String,
  date:        { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Workout', WorkoutSchema);