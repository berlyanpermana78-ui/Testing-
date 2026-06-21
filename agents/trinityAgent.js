const { AIClient, WebSearch } = require('./aiClient');
const config = require('../config/endpoints.json');

const client = new AIClient();
const searcher = new WebSearch();

class TrinityAgent {
    // Fungsi pembersih teks untuk menghapus karakter spesial sesuai request
    cleanText(text) {
        if (!text) return "";
        // Menghapus karakter /, * # & ( } dan sejenisnya agar pure text
        return text.replace(/[\/*#&({}\[\]<>\\|^`~]/g, '').trim();
    }

    async process(prompt, mode = 'agent') {
        let logs = [];
        logs.push("[SYSTEM] Initializing...");

        const needsSearch = this.analyzeNeedForSearch(prompt);
        let context = prompt;

        if (needsSearch) {
            logs.push("[NETWORK] Web Search Active...");
            const searchData = await searcher.search(prompt);
            context = `User: ${prompt}\nContext: ${searchData}`;
            logs.push("[NETWORK] Context Integrated.");
        }

        let finalAnswer = "";

        if (mode === 'agent') {
            logs.push("[CORE] Multi-Core Consensus (3 AI)...");
            const responses = await Promise.all([
                client.fetchResponse(0, context),
                client.fetchResponse(1, context),
                client.fetchResponse(2, context)
            ]);
            finalAnswer = responses.join("\n\n");
        } else {
            logs.push("[CORE] Daily Mode (1 AI)...");
            finalAnswer = await client.fetchResponse(0, context);
        }

        logs.push("[SYNTHESIS] Cleaning output to pure text...");
        const cleanedAnswer = this.cleanText(finalAnswer);

        return {
            answer: cleanedAnswer,
            thoughtProcess: logs,
            timestamp: new Date().toISOString()
        };
    }

    analyzeNeedForSearch(prompt) {
        const keywords = ['siapa', 'apa', 'kapan', 'dimana', 'terbaru', 'berita', 'harga', 'search', 'cari', 'current', 'latest'];
        return keywords.some(k => prompt.toLowerCase().includes(k));
    }
}

module.exports = new TrinityAgent();
