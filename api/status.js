module.exports = async (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        name: 'Trinity AI', 
        version: '1.0.0', 
        uptime: 'Serverless',
        latency: Math.floor(Math.random() * 100) + 'ms' 
    });
};
