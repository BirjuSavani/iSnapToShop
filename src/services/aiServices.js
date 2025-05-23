const axios = require('axios');
const FormData = require('form-data');

class AIService {
  /**
   * Creates a new AIService instance
   * @param {Object} options - Configuration options
   * @param {string} options.baseUrl - The base URL of the AI service
   * @param {string} options.apiKey - The API key for the AI service
   */
  constructor(options = {}) {
    this.baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000';
    this.apiKey = process.env.AI_SERVICE_KEY;
  }

  /**
   * Checks the health of the AI service.
   * @async
   * @returns {Object} - An object containing the health status, model information, and device information.
   */
  async checkHealth() {
    try {
      console.log('Checking AI service health');
      const response = await axios.get(`${this.baseUrl}/health`);

      console.log(
        `AI service health check successful: Model ${response.data.model} on ${response.data.device}`
      );

      return {
        healthy: response.status === 200,
        model: response.data.model,
        device: response.data.device,
      };
    } catch (error) {
      console.error(`AI Service health check failed: ${error.message}`, { error: error.stack });
      return { healthy: false, error: error.message };
    }
  }

  /**
   * Indexes products in the AI service.
   * @async
   * @param {Array} products - An array of products to be indexed.
   * @param {string} companyId - The company ID associated with the products.
   * @returns {Object} - An object containing the result of the indexing operation.
   */
  async indexProducts(products, companyId, applicationId) {
    try {
      console.log(`Indexing ${products.length} products for company ${companyId}`);
      
      const { data } = await axios.post(
        `${this.baseUrl}/embeddings_store`,
        { products: products, application_id: applicationId },
        {
          headers: {
            'X-API-KEY': this.apiKey,
          },
        }
      );

      console.log(`Indexing successful. Indexed ${products.length} products`);

      return data;
    } catch (error) {
      console.error(`Product indexing failed: ${error.message}`, {
        error: error.stack,
        companyId,
        productCount: products.length,
      });
      throw new Error(`Indexing failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Searches for products using image with enhanced error handling and caching
   * @async
   * @param {Buffer} imageBuffer - Image buffer to search
   * @param {string} companyId - Company identifier
   * @returns {Promise<{matches: Array, metadata: Object}>} - Search results
   */
  async searchByImage(imageBuffer, companyId) {
    try {
      const formData = new FormData();
      formData.append('image', imageBuffer, {
        filename: 'search-image.jpg',
        contentType: 'image/jpeg',
      });
      formData.append('company_id', companyId);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const { data } = await axios.post(`${this.baseUrl}/search/image`, formData, {
        signal: controller.signal,
        headers: {
          'X-API-KEY': this.apiKey,
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });

      clearTimeout(timeout);
      return { matches: data, metadata: {} };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('AI service timeout');
      }
      throw new Error(`AI service error: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Indexes a single product in the AI service.
   * @async
   * @param {Object} product - The product to be indexed.
   * @param {string} companyId - The company ID associated with the product.
   * @returns {Object} - An object containing the result of the indexing operation.
   */
  async indexSingleProduct(product, companyId) {
    try {
      console.log(`Indexing single product ${product.id} for company ${companyId}`);

      return await this.indexProducts([product], companyId);
    } catch (error) {
      console.error(`Single product indexing failed: ${error.message}`, {
        error: error.stack,
        productId: product.id,
        companyId,
      });
      throw error;
    }
  }

  /**
   * Checks the system status of the AI service.
   * @async
   * @returns {Object} - An object containing the system status.
   */
  async removeIndex(applicationId) {
    try {
      console.log(`Removing index for application ${applicationId}`);
      const { data } = await axios.post(
        `${this.baseUrl}/delete_embeddings`,
        { application_id: applicationId },
        {
          headers: {
            'X-API-KEY': this.apiKey,
          },
        }
      );

      console.log(`Index removal successful for company ${applicationId}`);

      return data;
    } catch (error) {
      console.error(`Index removal failed: ${error.message}`, {
        error: error.stack,
        applicationId,
      });
      throw new Error(`Index removal failed: ${error.response?.data?.error || error.message}`);
    }
  }
}

module.exports = { AIService };
