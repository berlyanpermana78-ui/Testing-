const { fetchAI, fetchSearch } = require('./aiCore');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { prompt, mode } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        let context = prompt;
        const keywords = ['siapa', 'apa', 'kapan', 'dimana', 'terbaru', 'berita', 'harga', 'search', 'cari', 'latest'];
        const needsSearch = keywords.some(k => prompt.toLowerCase().includes(k));

        if (needsSearch) {
            const searchData = await fetchSearch(prompt);
            context = `User: ${prompt}\nWeb Context: ${searchData}`;
        }

        let answer = "";
        if (mode === 'daily') {
            answer = await fetchAI(0, context);
        } else {
            // Agent Mode: Consensus of 3 AI
            const results = await Promise.all([
                fetchAI(0, context),
                fetchAI(1, context),
                fetchAI(2, context)
            ]);
            answer = results.join("\n\n---\n\n");
        }

        res.status(200).json({ 
            success: true, 
            answer: answer,
            mode: mode || 'agent'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
