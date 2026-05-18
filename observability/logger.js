const fs = require('fs');
const path = require('path');

// Ensure log directory exists at the root
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const formatLog = (level, message, service = 'backend', metadata = {}) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    service,
    message,
    ...metadata
  });
};

const logger = {
  info: (message, service = 'backend', metadata = {}) => {
    const log = formatLog('INFO', message, service, metadata);
    console.log(log);
    try {
      fs.appendFileSync(path.join(logDir, 'combined.log'), log + '\n');
    } catch (err) {
      // Fail-silent on read-only filesystems
    }
  },
  error: (message, service = 'backend', metadata = {}) => {
    const log = formatLog('ERROR', message, service, metadata);
    console.error(log);
    try {
      fs.appendFileSync(path.join(logDir, 'error.log'), log + '\n');
      fs.appendFileSync(path.join(logDir, 'combined.log'), log + '\n');
    } catch (err) {
      // Fail-silent
    }
  },
  warn: (message, service = 'backend', metadata = {}) => {
    const log = formatLog('WARN', message, service, metadata);
    console.warn(log);
    try {
      fs.appendFileSync(path.join(logDir, 'combined.log'), log + '\n');
    } catch (err) {
      // Fail-silent
    }
  },
  debug: (message, service = 'backend', metadata = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      const log = formatLog('DEBUG', message, service, metadata);
      console.log(log);
    }
  }
};

module.exports = logger;
