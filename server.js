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
const { logger, requestLogger } = require('./src/utils/logger');
const Sentry = require('./src/utils/instrument');

dayjs.extend(utc);
dayjs.extend(timezone);

const scanRoutes = require('./src/routes/scanRoutes');
const proxyRoutes = require('./src/routes/proxyRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

const STATIC_PATH =
  process.env.NODE_ENV === 'production'
    ? path.join(process.cwd(), 'frontend', 'public', 'dist')
    : path.join(process.cwd(), 'frontend');

const app = express();

// Middleware
app.use(cookieParser('ext.session'));
app.use(express.json());
app.use(bodyParser.json({ limit: '2mb' }));
app.use(serveStatic(STATIC_PATH, { index: false }));
app.use('/generated', express.static(path.join(__dirname, 'public/generated')));
app.use(requestLogger);

// Enable CORS
app.options('*', cors('*'));

// API Routes Setup
const platformApiRoutes = fdkExtension.platformApiRoutes;
const applicationProxyRoutes = fdkExtension.applicationProxyRoutes;

platformApiRoutes.use('/scan', scanRoutes);
platformApiRoutes.use('/proxy-path', proxyRoutes);
applicationProxyRoutes.use('/proxy/scan', scanRoutes);

app.use('/api/platform', platformApiRoutes);
app.use('/api', applicationProxyRoutes);
app.use('/', fdkExtension.fdkHandler);

app.use('/api/analytics', analyticsRoutes);

// Webhook handler
app.post('/api/webhook-events', async (req, res) => {
  try {
    logger.info(`Webhook Event: ${req.body.event} received`);
    await fdkExtension.webhookRegistry.processWebhook(req);
    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error(`Error Processing Webhook`, { error: err });
    Sentry.captureException('Error in webhook handler function', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  try {
    logger.info('Health check accessed');
    res.json({ success: true, message: 'Server is running' });
  } catch (error) {
    logger.error('Error in health check', { error });
    Sentry.captureException('Error in health check function', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fallback: Serve frontend React app
app.get('*', (req, res) => {
  const filePath = path.join(STATIC_PATH, 'index.html');
  logger.info(`Serving index.html for route: ${req.originalUrl}`);
  return res.status(200).set('Content-Type', 'text/html').send(readFileSync(filePath));
});

module.exports = app;
