const winston = require('winston');
require('winston-daily-rotate-file');

// Create a logger
const logTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',  // Log file pattern
  datePattern: 'YYYY-MM-DD',               // Daily rotation
  maxSize: '20m',                          // Max file size before rotation
  maxFiles: '30d',                         // Keep logs for 30 days
  level: 'info',                           // Set log level
});

const logger = winston.createLogger({
  transports: [
    logTransport,
    new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple()) }), // Console logging for development
  ],
});

module.exports = logger;
