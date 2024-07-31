const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const CalculatorLog = require('./models/calculatorLog');
const getNextSequenceValue = require('./models/getNextSequenceValue');
const logger = require('./logger'); // Import the logger

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173', // Update this to your frontend's URL
    methods: ['GET', 'POST']
  }
});

app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:5173' // Update this to your frontend's URL
}));

mongoose.connect('mongodb+srv://yashlokhande20:uojFh8jz90JeyEA4@cluster0.lp2oclz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  logger.info('Connected to MongoDB');
}).catch((error) => {
  logger.error(`Error connecting to MongoDB: ${error.message}`);
});

// Socket.IO connection
io.on('connection', (socket) => {
  logger.info('New client connected');
  socket.on('disconnect', () => {
    logger.info('Client disconnected');
  });
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

    // Emit the new log to all connected clients
    io.emit('log', newLog);

    logger.info(`New log saved ${JSON.stringify(newLog)}`);
    res.status(201).json(newLog);
  } catch (error) {
    logger.error('Error saving log:', { error });
    res.status(500).send('Server Error');
  }
});

// GET endpoint to fetch logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await CalculatorLog.find().sort({ created_on: -1 }).limit(10);
    logger.info(`Logs fetched:${JSON.stringify(logs)}`);
    res.json(logs);
  } catch (error) {
    logger.error('Error fetching logs:', { error });
    res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
