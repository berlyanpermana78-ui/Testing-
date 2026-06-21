const axios = require('axios');
const config = require('../config/endpoints.json');

class AIClient {
    constructor() {
        this.client = axios.create({
            timeout: 15000,
            headers: {
                'User-Agent': config.userAgent,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }

    async fetchResponse(endpointIndex, text) {
        const url = config.endpoints[endpointIndex] + encodeURIComponent(text);
        try {
            const response = await this.client.get(url);
            return typeof response.data === 'object' ? JSON.stringify(response.data) : response.data;
        } catch (e) {
            return `Error Core ${endpointIndex + 1}`;
        }
    }
}

class WebSearch {
    constructor() {
        this.client = axios.create({
            timeout: 10000,
            headers: { 'User-Agent': config.userAgent }
        });
    }

    async search(query) {
        const url = config.searchEngine + encodeURIComponent(query);
        try {
            const response = await this.client.get(url);
            return typeof response.data === 'object' ? JSON.stringify(response.data) : response.data;
        } catch (e) {
            return `Search Error`;
        }
    }
}

module.exports = { AIClient, WebSearch };
