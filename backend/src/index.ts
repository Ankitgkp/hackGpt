import { OpenRouter } from '@openrouter/sdk';
import { SYSTEM_PROMPT } from './prompts.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { parseAIResponse } from './parser.js';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.get('/test', (req, res) => {
    res.status(200).json({
        message: "Working"
    });
});

app.post('/send', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
        res.status(403).json({ message: "Invalid inputs" });
        return;
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const client = new OpenRouter({
            apiKey: process.env.OPENROUTER_API_KEY || ""
        });

        const response = await client.chat.send({
            chatGenerationParams: {
                model: "arcee-ai/trinity-large-preview:free",
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: "user", content: prompt },
                ],
            }
        });

        const rawContent = String(response.choices[0].message.content || '');
        const parsed = parseAIResponse(rawContent);
        const chunkSize = 3;
        for (let i = 0; i < parsed.length; i += chunkSize) {
            const chunk = parsed.slice(i, i + chunkSize);
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
            await new Promise(resolve => setTimeout(resolve, 15));
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Error:', error);
        res.write(`data: ${JSON.stringify({ error: "Failed" })}\n\n`);
        res.end();
    }
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});
