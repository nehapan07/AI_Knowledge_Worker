const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Update: Configure CORS to allow requests only from your Netlify frontend.
const allowedOrigins = [
    'https://autonomous-ai-knowledge-worker.netlify.app',
    'http://localhost:3000'
];

app.use(cors({
    origin: function(origin, callback){
        // allow requests with no origin (like mobile apps or curl requests)
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

app.use(express.json());

// New root path for server health check
app.get('/', (req, res) => {
    res.status(200).send('Backend server is live! 🚀');
});

// News API endpoint
app.get('/api/news', async (req, res) => {
    const { topic } = req.query;
    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        const apiKey = process.env.NEWS_API_KEY;
        const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&apiKey=${apiKey}`;
        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        console.error('News API error:', error.message);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// Stock API endpoint
app.get('/api/stock', async (req, res) => {
    const { symbol } = req.query;
    if (!symbol) {
        return res.status(400).json({ error: 'Stock symbol is required' });
    }

    try {
        const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
        const apiUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
        const response = await axios.get(apiUrl);
        const data = response.data;
        if (data["Error Message"] || data["Note"] || Object.keys(data).length === 0) {
            throw new Error("Invalid symbol or API limit reached.");
        }
        res.json(data);
    } catch (error) {
        console.error('Stock API error:', error.message);
        res.status(500).json({ error: 'Failed to fetch stock data' });
    }
});

// AI Analysis endpoint
app.post('/api/analyze', async (req, res) => {
    const { data } = req.body;
    if (!data) {
        return res.status(400).json({ error: 'Data is required' });
    }

    const systemPrompt = `You are an expert financial analyst. Your task is to analyze the provided JSON data and deliver a report.
RULES:
1. Your response MUST start with the line "Summary:".
2. After the summary, your response MUST include the line "Key Insights:".
3. Under "Key Insights:", you MUST list three numbered insights on new lines.
4. DO NOT use any markdown formatting.`;

    const userQuery = `Analyze the following data: ${JSON.stringify(data, null, 2)}`;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`;
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    try {
        const response = await axios.post(apiUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            throw new Error("The AI returned an empty response.");
        }
        res.json({ analysis: text });
    } catch (error) {
        if (error.response) {
            console.error('Gemini API error response data:', error.response.data);
            console.error('Gemini API error response status:', error.response.status);
            console.error('Gemini API error response headers:', error.response.headers);
        } else {
            console.error('Gemini API error:', error.message);
        }
        res.status(500).json({ error: 'Failed to analyze data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
