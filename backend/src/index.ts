import { OpenRouter } from '@openrouter/sdk';
import { SYSTEM_PROMPT } from './prompts.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { parseAIResponse } from './parser.js';
import prisma from './db.js';
import { requireAuth, optionalAuth, AuthRequest } from './middleware.js';
import authRouter from './auth.js';
dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(express.json());

// ── Auth routes ───────────────────────────────────────────────────────────────
app.use('/auth', authRouter);

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/test', (_req, res) => { res.json({ message: 'Working' }); });

// ── Sessions (require auth) ───────────────────────────────────────────────────

app.get('/sessions', requireAuth, async (req: AuthRequest, res) => {
    try {
        const sessions = await prisma.session.findMany({
            where: { userId: req.userId },
            orderBy: { updatedAt: 'desc' },
            select: { id: true, title: true, createdAt: true, updatedAt: true },
        });
        res.json(sessions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch sessions' });
    }
});

app.post('/sessions', requireAuth, async (req: AuthRequest, res) => {
    try {
        const session = await prisma.session.create({
            data: { title: 'New Chat', userId: req.userId },
        });
        res.status(201).json(session);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create session' });
    }
});

app.delete('/sessions/:id', requireAuth, async (req: AuthRequest, res) => {
    const id = req.params.id as string;
    try {
        const session = await prisma.session.findFirst({
            where: { id, userId: req.userId },
        });
        if (!session) { res.status(404).json({ message: 'Session not found' }); return; }
        await prisma.session.delete({ where: { id } });
        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete session' });
    }
});

app.get('/sessions/:id/messages', requireAuth, async (req: AuthRequest, res) => {
    const id = req.params.id as string;
    try {
        const session = await prisma.session.findFirst({
            where: { id, userId: req.userId },
        });
        if (!session) { res.status(404).json({ message: 'Session not found' }); return; }
        const messages = await prisma.message.findMany({
            where: { sessionId: id },
            orderBy: { createdAt: 'asc' },
        });
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

// ── Chat – works for guests (no persist) and logged-in users (persists) ───────

app.post('/send', optionalAuth, async (req: AuthRequest, res) => {
    const { prompt, sessionId } = req.body;
    if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ message: 'Invalid input' });
        return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        // Only persist when the user is authenticated and a sessionId is given
        if (req.userId && sessionId) {
            await prisma.message.create({ data: { role: 'user', content: prompt, sessionId } });
            const msgCount = await prisma.message.count({ where: { sessionId } });
            const updateData = msgCount === 1
                ? { title: prompt.slice(0, 60).trim(), updatedAt: new Date() }
                : { updatedAt: new Date() };
            await prisma.session.update({ where: { id: sessionId }, data: updateData });
        }

        const client = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY || '' });
        const response = await client.chat.send({
            chatGenerationParams: {
                model: 'arcee-ai/trinity-large-preview:free',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: prompt },
                ],
            },
        });

        const rawContent = String(response.choices[0].message.content || '');
        const parsed = parseAIResponse(rawContent);

        if (req.userId && sessionId) {
            await prisma.message.create({ data: { role: 'assistant', content: rawContent, sessionId } });
        }

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
        res.write(`data: ${JSON.stringify({ error: 'Failed' })}\n\n`);
        res.end();
    }
});

app.listen(3000, () => console.log('Listening on port 3000'));

