const mongoose = require('mongoose');

const BMISchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  age:    { type: Number },
  bmi:    { type: Number, required: true },
  category: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('BMI', BMISchema);