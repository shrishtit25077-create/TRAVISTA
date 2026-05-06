const axios = require('axios');

class UnsplashService {
  constructor() {
    this.accessKey = process.env.UNSPLASH_ACCESS_KEY;
    this.baseUrl = 'https://api.unsplash.com';
  }

  async getImages(query, limit = 3) {
    try {
      const response = await axios.get(`${this.baseUrl}/search/photos`, {
        headers: {
          Authorization: `Client-ID ${this.accessKey}`
        },
        params: {
          query,
          per_page: limit,
          orientation: 'landscape'
        }
      });
      return response.data.results.map(img => img.urls.regular);
    } catch (error) {
      console.error('Unsplash Error:', error.message);
      return [];
    }
  }
}

module.exports = new UnsplashService();
