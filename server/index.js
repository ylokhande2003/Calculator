const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const CalculatorLog = require('./models/calculatorLog');
const logger = require('./logger');

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

app.post('/api/logs', async (req, res) => {
  const { expression, isValid, output } = req.body;

  if (!expression) {
    return res.status(400).json({ error: 'Expression is empty' });
  }

  try {
    const log = new CalculatorLog({
      expression,
      is_valid: isValid,
      output
    });
    await log.save();
    logger.info(`Created log: ${JSON.stringify(log)}`);
    res.status(201).json(log);
  } catch (error) {
    // logger.error(`Error creating log: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/logs', async (req, res) => {
  try {
    const logs = await CalculatorLog.find().sort({ created_on: -1 }).limit(10);
    // logger.info(`Fetched logs: ${JSON.stringify(logs)}`);
    res.status(200).json(logs);
  } catch (error) {
    // logger.error(`Error fetching logs: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
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
