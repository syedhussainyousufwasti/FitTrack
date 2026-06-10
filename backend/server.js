require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app = express();

// CORS first
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log ALL incoming requests
app.use(function(req, res, next) {
  console.log('----------------------------');
  console.log('METHOD:', req.method);
  console.log('URL:', req.url);
  console.log('BODY:', req.body);
  console.log('----------------------------');
  next();
});

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Atlas Connected!'))
  .catch(err => console.error('MongoDB Error:', err.message));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/goals',    require('./routes/goals'));

app.get('/', (req, res) => {
  res.json({ message: 'FitTrack API is running' });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});