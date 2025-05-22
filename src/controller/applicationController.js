const axios = require('axios');

// Get all applications
exports.getAllApplications = async (req, res, next) => {
  try {
    const { platformClient } = req;
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    if (!platformClient) {
      return res.status(401).json({ message: 'Platform client is not available' });
    }

    const token = platformClient.config.oauthClient.token;
    let allApplications = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const apiUrl = `${platformClient.config.domain}/service/platform/configuration/v1.0/company/${company_id}/application?page_no=${page}&page_size=10`;

      const { data } = await axios.get(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (data?.items?.length > 0) {
        allApplications = [
          ...allApplications,
          ...data.items.map(({ _id, name, logo }) => ({
            _id,
            name,
            logo: logo?.secure_url || null,
          })),
        ];
        page++;
      } else {
        hasMore = false;
      }
    }
    return res.json(allApplications);
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};
