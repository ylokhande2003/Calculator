const { createLogger, format, transports } = require('winston');
const { combine, printf } = format;
const path = require('path');

const logFormat = printf(({ level, message}) => {
    return `${level}: ${message}`;
  });


const logger = createLogger({
    level: 'info',
    format: combine(
      logFormat
    ),
    transports: [
      new transports.File({ filename: path.join(__dirname, 'logs', `${new Date().toISOString().split('T')[0]}.log`) })
    ]
  });
  module.exports = logger;