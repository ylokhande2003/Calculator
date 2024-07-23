const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const CalculatorLog = require('./models/calculatorLog');
const logger = require('./logger');
const getNextSequenceValue = require('./models/getNextSequenceValue');
const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb+srv://yashlokhande20:uojFh8jz90JeyEA4@cluster0.lp2oclz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.log(`Error connecting to MongoDB: ${error.message}`);
});


// POST endpoint to add a log
app.post('/api/logs', async (req, res) => {
  try {
    const { expression, isValid, output } = req.body;

    const nextId = await getNextSequenceValue('calculator_log_id');

    const newLog = new CalculatorLog({
      _id: nextId,
      expression,
      is_valid: isValid,
      output
    });

    await newLog.save();
    res.status(201).json(newLog);
  } catch (error) {
    console.error('Error saving log:', error);
    res.status(500).send('Server Error');
  }
});

// GET endpoint to fetch logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await CalculatorLog.find().sort({ created_on: -1 }).limit(10);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).send('Server Error');
  }
});


app.use((err, req, res, next) => {
  // logger.error(`Application error: ${err.message}`);
  console.log(`Application error: ${err.message}`);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});
