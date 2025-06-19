const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const https = require('https');
const path = require('path');
const uuidv4 = require('uuid').v4;
const DEFAULT_BASE_URL = 'http://localhost:5000';
const os = require('os');
const { logger } = require('../utils/logger');

class AIService {
  /**
   * @param {Object} options
   * @param {string} [options.baseUrl]
   * @param {string} [options.apiKey]
   * @param {number} [options.timeoutMs]
   */
  constructor(options = {}) {
    this.baseUrl = process.env.AI_SERVICE_URL || options.baseUrl || DEFAULT_BASE_URL;
    this.apiKey = process.env.AI_SERVICE_KEY || options.apiKey;

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-API-KEY': this.apiKey,
      },
    });
  }

  async checkHealth() {
    try {
      logger.info('Checking AI service health...');
      const { data, status } = await this.axiosInstance.get('/health');

      const { model, device } = data;

      logger.info(`AI Service healthy: Model=${model}, Device=${device}`);

      return {
        healthy: status === 200,
        model,
        device,
      };
    } catch (error) {
      logger.error('AI Service health check failed:', error.message);
      return { healthy: false, error: error.message };
    }
  }

  async indexProducts(products, companyId, applicationId) {
    try {
      logger.info(
        `Indexing ${products.length} products for company=${companyId}, app=${applicationId}`
      );
      const response = await this.axiosInstance.post('/embeddings_store', {
        products,
        application_id: applicationId,
      });

      logger.info('Product indexing successful');
      return response.data;
    } catch (error) {
      logger.error('Product indexing failed:', error.message, {
        companyId,
        productCount: products.length,
      });
      throw new Error(`Indexing failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async searchByImage(imageBuffer, companyId) {
    const formData = new FormData();
    formData.append('image', imageBuffer, {
      filename: 'search-image.jpg',
      contentType: 'image/jpeg',
    });
    formData.append('company_id', companyId);

    try {
      const response = await this.axiosInstance.post('/search/image', formData, {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      return {
        matches: response.data,
        metadata: {},
      };
    } catch (error) {
      // Check for timeout or network errors
      if (error.code === 'ECONNABORTED') {
        throw new Error('AI service timeout');
      }
      throw new Error(`AI service error: ${error.response?.data?.error || error.message}`);
    }
  }

  async indexSingleProduct(product, companyId, applicationId) {
    try {
      logger.info(`Indexing single product ${product.id} for company=${companyId}`);
      return await this.indexProducts([product], companyId, applicationId);
    } catch (error) {
      logger.error(`Single product indexing failed: ${error.message}`, {
        productId: product.id,
        companyId,
      });
      throw error;
    }
  }

  async removeIndex(applicationId) {
    try {
      logger.info(`Removing index for application=${applicationId}`);

      const response = await this.axiosInstance.post('/delete_embeddings', {
        application_id: applicationId,
      });

      logger.info('Index removal successful');
      return response.data;
    } catch (error) {
      logger.error(`Index removal failed: ${error.message}`, { applicationId });
      throw new Error(`Index removal failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async generatePromptsToImage(prompt) {
    try {
      const response = await this.axiosInstance.post(
        '/generate_prompts_to_image',
        { prompt },
        { responseType: 'stream' }
      );

      const contentType = response.headers['content-type'];
      const ext = contentType?.split('/')[1] || 'png';
      const fileName = `generated_image_${uuidv4()}.${ext}`;

      // Use system temp directory instead of public directory
      const filePath = path.join(os.tmpdir(), fileName);

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve({ filePath, fileName }));
        writer.on('error', reject);
      });
    } catch (error) {
      logger.error(`Generate prompts to image failed: ${error.message}`);
      throw new Error(
        `Generate prompts to image failed: ${error.response?.data?.error || error.message}`
      );
    }
  }
}

module.exports = { AIService };
