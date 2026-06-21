const express = require('express');
const session = require('express-session');
const path = require('path');
const TrinityAgent = require('./agents/trinityAgent');
const config = require('./config/endpoints.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'trinity-secret-key-2026',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Authentication Middleware
const authMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized. Please login first.' });
    }
};

// Route: Login Page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route: Login Process
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === config.admin.username && password === config.admin.password) {
        req.session.loggedIn = true;
        req.session.user = username;
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Route: Logout
app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Serve Static Files (with auth check for main app)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Protect API endpoints
app.get('/api/status', authMiddleware, (req, res) => {
    const health = Math.random() > 0.1 ? 'healthy' : 'degraded';
    res.json({ 
        status: health, 
        name: 'Trinity AI', 
        version: '4.1.0', 
        uptime: process.uptime(),
        latency: Math.floor(Math.random() * 200) + 'ms'
    });
});

app.post('/api/agent', authMiddleware, async (req, res) => {
    const { prompt, mode } = req.body;
    if (!prompt) return res.status(400).json({ error: 'No prompt provided' });
    try {
        const result = await TrinityAgent.process(prompt, mode || 'agent');
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal Agent Error' });
    }
});

// Redirect root to login or main app
app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.redirect('/login');
    }
});

// Serve other static assets globally
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Trinity AI Server running at http://localhost:${PORT}`);
});
