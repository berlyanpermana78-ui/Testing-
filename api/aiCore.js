const axios = require('axios');
const config = require('../config/endpoints.json');

const cleanResponse = (text) => {
    if (!text) return "";
    try {
        // Attempt to parse as JSON if it looks like JSON
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            const json = JSON.parse(text);
            // Look for common keys: result, text, answer, content
            return json.result || json.text || json.answer || json.content || text;
        }
    } catch (e) {
        // Not JSON, continue to text cleaning
    }
    // Final cleaning: remove special characters as requested
    return text.replace(/[\/*#&({}\[\]<>\\|^`~]/g, '').trim();
};

const fetchAI = async (endpointIndex, text) => {
    const url = config.endpoints[endpointIndex] + encodeURIComponent(text);
    try {
        const res = await axios.get(url, { 
            headers: { 'User-Agent': config.userAgent },
            timeout: 10000 
        });
        const data = typeof res.data === 'object' ? JSON.stringify(res.data) : res.data;
        return cleanResponse(data);
    } catch (e) {
        return `[Core ${endpointIndex + 1} Offline]`;
    }
};

const fetchSearch = async (query) => {
    const url = config.searchEngine + encodeURIComponent(query);
    try {
        const res = await axios.get(url, { 
            headers: { 'User-Agent': config.userAgent },
            timeout: 10000 
        });
        const data = typeof res.data === 'object' ? JSON.stringify(res.data) : res.data;
        return cleanResponse(data);
    } catch (e) {
        return `[Search Offline]`;
    }
};

module.exports = { fetchAI, fetchSearch };
