'use strict';

require('dotenv').config();
const app = require('./server');
const { logger } = require('./src/utils/logger');
const port = process.env.BACKEND_PORT || 8080;

app.listen(port, () => {
  logger.info(`🚀 Server listening at http://localhost:${port}`);
});