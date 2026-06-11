const express = require('express');
const router  = express.Router();
const BMI     = require('../models/BMI');

// GET — user ka BMI fetch karo
router.get('/:userId', async (req, res) => {
  try {
    const bmi = await BMI.findOne({ userId: req.params.userId });
    res.json(bmi || null);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// POST — save ya update karo (upsert)
router.post('/', async (req, res) => {
  try {
    const { userId, height, weight, age, bmi, category } = req.body;
    const existing = await BMI.findOne({ userId });

    if (existing) {
      return res.status(400).json({ message: 'BMI already saved. Use update instead.', exists: true });
    }

    const newBMI = new BMI({ userId, height, weight, age, bmi, category });
    await newBMI.save();
    res.json(newBMI);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// PUT — update karo
router.put('/:userId', async (req, res) => {
  try {
    const updated = await BMI.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;