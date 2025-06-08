const { logger } = require('../utils/logger');
const Event = require('../models/Event');
const Sentry = require('../utils/instrument');
const { ensureProxyPath } = require('./proxyController');

// Log an event
exports.logEvent = async ({ applicationId, companyId, type, query, imageId }) => {
  try {
    if (!applicationId || !companyId || !type) {
      logger.warn(`Missing required fields in logEvent`, { applicationId, companyId, type });
      return null;
    }

    const event = new Event({
      applicationId,
      companyId,
      type,
      query,
      imageId,
    });

    await event.save();

    logger.info('Event logged', {
      applicationId,
      companyId,
      type,
      query,
      imageId,
    });

    return event;
  } catch (error) {
    logger.error('Failed to log event', { error });
    Sentry.captureException('Error in logEvent function', error);
    return null;
  }
};

exports.getReport = async (req, res) => {
  try {
    const { applicationId, startDate, endDate, companyId } = req.query;

    if (!applicationId) {
      return res.status(400).json({ error: 'applicationId is required' });
    }

    const now = new Date();

    // Use provided date range or default last 30 days
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : now;

    // Base filter for events
    const baseMatch = {
      applicationId,
      timestamp: {
        $gte: start,
        $lte: end,
      },
    };

    // 1. Aggregate counts by type in given range (like before)
    const typeCounts = await Event.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert to easier lookup map
    const countsMap = {};
    for (const c of typeCounts) {
      countsMap[c._id] = c.count;
    }

    // 2. Calculate Match Rate: image_search / (image_search + image_not_found)
    const searches = countsMap['image_search'] || 0;
    const notFound = countsMap['image_not_found'] || 0;
    const totalSearches = searches + notFound;
    const matchRate = totalSearches > 0 ? (searches / totalSearches) * 100 : 0;

    // 3. Calculate Avg Daily Searches in the date range
    const diffTime = Math.abs(end - start);
    const diffDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
    const avgDailySearches = totalSearches / diffDays;

    // 4. Search Trends - last 7 days daily counts of image_search type
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last7DaysMatch = {
      applicationId,
      type: 'image_search',
      timestamp: { $gte: sevenDaysAgo, $lte: now },
    };

    const searchTrends = await Event.aggregate([
      { $match: last7DaysMatch },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ]);

    // Format trends as date: count map for easier frontend use
    const trendsFormatted = searchTrends.map(item => {
      const { year, month, day } = item._id;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return { date: dateStr, count: item.count };
    });

    // ✅ Run proxy path creation in background — do not await
    if (companyId && applicationId) {
      ensureProxyPath({ company_id: companyId, application_id: applicationId }).catch(err =>
        logger.warn('Background proxy creation failed:', err.message)
      );
    }

    res.json({
      report: typeCounts,
      matchRate: matchRate.toFixed(2), // as percentage string
      avgDailySearches: avgDailySearches.toFixed(2),
      searchTrends: trendsFormatted,
    });
  } catch (error) {
    logger.error('Error getting analytics report:', error);
    Sentry.captureException('Error in getReport function', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
