const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const serveStatic = require('serve-static');
const { readFileSync } = require('fs');
const { fdkExtension, getPlatformClientAsync } = require('./src/fdkConfig/fdkConfig');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const cors = require('cors');

dayjs.extend(utc);
dayjs.extend(timezone);

// Importing routes
const scanRoutes = require('./src/routes/scanRoutes');
const proxyRoutes = require('./src/routes/proxyRoutes');

/**
 * * Static path for serving frontend files
 * In production, it serves from the 'public/dist' directory
 * In development, it serves from the 'frontend' directory
 */
const STATIC_PATH =
  process.env.NODE_ENV === 'production'
    ? path.join(process.cwd(), 'frontend', 'public', 'dist')
    : path.join(process.cwd(), 'frontend');

// Initialize Express app
const app = express();

// Middleware
app.use(cookieParser('ext.session'));
app.use(express.json());
app.use(bodyParser.json({ limit: '2mb' }));
app.use(serveStatic(STATIC_PATH, { index: false }));

// Middleware to enable CORS
app.options('*', cors('*'));

// Platform client middleware
app.use(async (req, res, next) => {
  try {
    // Set platform client in request object
    const ptClient = await getPlatformClientAsync(req.query.company_id);
    req.platformClient = ptClient;
    next();
  } catch (error) {
    console.error(`Failed to get platform client: ${error.message}`, { error });
    next(error);
  }
});

// API Routes Setup
const platformApiRoutes = fdkExtension.platformApiRoutes;

const applicationProxyRoutes = fdkExtension.applicationProxyRoutes;

// Scan API routes
platformApiRoutes.use('/scan', scanRoutes);
// Application API routes
platformApiRoutes.use('/proxy-path', proxyRoutes);

applicationProxyRoutes.use('/proxy/scan', scanRoutes);

// If you are adding routes outside of the /api path,
// remember to also add a proxy rule for them in /frontend/vite.config.js
app.use('/api/platform', platformApiRoutes);

app.use('/api', applicationProxyRoutes);

// FDK extension handler and API routes (extension launch routes)
app.use('/', fdkExtension.fdkHandler);

// Route to handle webhook events and process it.
app.post('/api/webhook-events', async function (req, res) {
  try {
    console.log(`Webhook Event: ${req.body.event} received`);
    await fdkExtension.webhookRegistry.processWebhook(req);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(`Error Processing Webhook:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Server health check endpoint
app.get('/health', (req, res) => {
  try {
    console.log('Health check endpoint accessed');
    res.json({ success: true, message: 'Server is running' });
  } catch (error) {
    console.log('Error in health check endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  return res
    .status(200)
    .set('Content-Type', 'text/html')
    .send(readFileSync(path.join(STATIC_PATH, 'index.html')));
});

module.exports = app;
