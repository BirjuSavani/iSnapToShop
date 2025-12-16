'use strict';

require('dotenv').config();
// IMPORTANT: Make sure to import `instrument.js` at the top of your file.
// If you're using ECMAScript Modules (ESM) syntax, use `import "./instrument.js";`
require('./src/utils/instrument');
const app = require('./server');
const { logger } = require('./src/utils/logger');
// const Sentry = require('./src/utils/instrument');
const connectDB = require('./src/config/db');

const port = process.env.BACKEND_PORT || 8080;

// The error handler must be registered before any other error middleware and after all controllers
// Sentry.setupExpressErrorHandler(app);

/**
 * Connect to MongoDB
 */
connectDB();


app.listen(port, () => {
  logger.info(`🚀 Server listening at http://localhost:${port}`);
});
