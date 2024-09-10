const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logger = createLogger({
  format: combine(timestamp(), logFormat),
  transports: [
    new transports.Console(), // Logs to console
    new transports.File({ filename: "ethDepositTracker.log" }), // Logs to a file
  ],
});

module.exports = logger;
