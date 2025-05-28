'use strict';

require('dotenv').config();

exports.config = {  
  app_name: [process.env.NEW_RELIC_APP_NAME], 
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info', 
  },
  host: 'collector.newrelic.com', 
  distributed_tracing: {
    enabled: true, 
  },
  slow_sql: {
    enabled: true, 
  },
  transaction_tracer: {
    enabled: true, 
  },
};