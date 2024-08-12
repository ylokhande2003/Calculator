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
    origin: 'https://calcuator-from-yash.netlify.app', // Update this to your frontend's URL
    methods: ['GET', 'POST']
  }
});

app.use(bodyParser.json());
app.use(cors({
  origin: 'https://calcuator-from-yash.netlify.app' // Update this to your frontend's URL
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
// app.post('/api/logs', async (req, res) => {
//   try {
//     const { expression, isValid, output } = req.body;
//     const nextId = await getNextSequenceValue('calculator_log_id');

//     const newLog = new CalculatorLog({
//       _id: nextId,
//       expression,
//       is_valid: isValid,
//       output
//     });

//     await newLog.save();

//     // Emit the new log to all connected clients
//     io.emit('log', newLog);

//     logger.info(`New log saved ${JSON.stringify(newLog)}`);
//     res.status(201).json(newLog);
//   } catch (error) {
//     logger.error('Error saving log:', { error });
//     res.status(500).send('Server Error');
//   }
// });

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

// app.get('/api/logs/long-polling', async (req, res) => {
//   const { lastId } = req.query;

//   // Set a timeout for polling interval
//   const POLL_INTERVAL = 5000; // 5 seconds, adjust as needed
  
//   const checkForNewLogs = async () => {
//     try {
//       // Query for new logs since the lastId
//       const newLogs = await CalculatorLog.find({
//         _id: { $gt: lastId }
//       }).sort({ _id: -1 }).exec();

//       if (newLogs.length > 0) {
//         res.json(newLogs); // Respond with new logs
//       } else {
//         // No new logs, set a timeout and check again
//         setTimeout(checkForNewLogs, POLL_INTERVAL);
//       }
//     } catch (error) {
//       logger.error('Error in long polling', { error });
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
//   };

//   // Start checking for new logs
//   checkForNewLogs();

//   // Optional: Set a timeout for the client to cancel the request
//   req.on('close', () => {
//     logger.info('Client disconnected from long polling');
//   });
// });
// let evaluationCount = 0;
// let pendingResponse = null;

// app.post('/api/logs', async (req, res) => {
//   try {
//     const { expression, isValid, output } = req.body;
//     const nextId = await getNextSequenceValue('calculator_log_id');

//     const newLog = new CalculatorLog({
//       _id: nextId,
//       expression,
//       is_valid: isValid,
//       output
//     });

//     await newLog.save();

//     evaluationCount += 1;

//     if (pendingResponse && evaluationCount >= 5) {
//       const logs = await CalculatorLog.find().sort({ created_on: -1 }).limit(5);
//       pendingResponse.json(logs);  // Send the logs and close the connection
//       pendingResponse = null;
//       evaluationCount = 0;  // Reset the counter
//     }

//     res.status(201).json(newLog);
//   } catch (error) {
//     res.status(500).send('Server Error');
//   }
// });

// app.get('/api/logs/long-polling', async (req, res) => {
//   if (evaluationCount < 5) {
//     pendingResponse = res;  // Keep the connection open
//   } else {
//     const logs = await CalculatorLog.find().sort({ created_on: -1 }).limit(5);
//     res.json(logs);  // Send logs immediately if count >= 5
//     evaluationCount = 0;  // Reset the counter
//   }

//   req.on('close', () => {
//     if (pendingResponse === res) {
//       pendingResponse = null;
//     }
//   });
// });
let evaluationCount = 0;
let pendingResponse = null;

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

    evaluationCount += 1;

    if (pendingResponse) {
      pendingResponse.write(`data: ${JSON.stringify(newLog)}\n\n`);  // Stream log to client

      if (evaluationCount >= 5) {
        pendingResponse.end();  // Close the connection after sending 5 logs
        pendingResponse = null;
        evaluationCount = 0;
      }
    }

    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

app.get('/api/logs/long-polling', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  if (evaluationCount >= 5) {
    try {
      const logs = await CalculatorLog.find().sort({ created_on: -1 }).limit(5);
      logs.forEach(log => {
          
        res.write(`data: ${JSON.stringify(log)}\n\n`);  // Send each log as a separate event
      });
      res.end();  // End the connection after sending logs
      evaluationCount = 0;  // Reset the counter
    } catch (error) {
      res.status(500).send('Error fetching logs');
    }
  } else {
    pendingResponse = res;  // Keep the connection open
  }

  req.on('close', () => {
    if (pendingResponse === res) {
      pendingResponse = null;
    }
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
