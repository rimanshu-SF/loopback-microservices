import winston from 'winston';
import { Client } from '@opensearch-project/opensearch';
import TransportStream from 'winston-transport';

require('dotenv').config()
// Create OpenSearch client
const client = new Client({
  node: 'http://127.0.0.1:9200', // Replace with your domain
  ssl: {
    rejectUnauthorized: false, // If using self-signed certs (not recommended for prod)
  },
});

// Custom transport to send logs to OpenSearch
class OpenSearchTransport extends TransportStream {
  log(info: any, callback: () => void) {
    setImmediate(() => this.emit('logged', info));

    client.index({
      index: 'bms-logs', // Choose your index name
      body: {
        timestamp: new Date().toISOString(),
        level: info.level,
        message: info.message,
        meta: info.meta,
      },
    }).catch(err => {
      console.error('Failed to send log to OpenSearch', err);
    });

    callback();
  }
}

// Winston logger with OpenSearch transport
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new OpenSearchTransport(),
    new winston.transports.Console(),
  ],
});

export default logger;
