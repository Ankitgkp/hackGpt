import { OpenRouter } from '@openrouter/sdk';
import { SYSTEM_PROMPT } from './prompts.js';
import express from 'express';
import cors from 'cors';
import prisma from './db.js';
import { requireAuth, optionalAuth, AuthRequest } from './middleware.js';
import authRouter from './auth.js';

const openRouter = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY || '' });

const app = express();
app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(express.json());

app.use('/auth', authRouter);
app.get('/test', (_req, res) => { res.json({ message: 'Working' }); });
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
        const isAuthed = !!(req.userId && sessionId);
        let history: { role: string; content: string }[] = [];
        if (isAuthed) {
            history = await prisma.message.findMany({
                where: { sessionId },
                orderBy: { createdAt: 'asc' },
                select: { role: true, content: true },
            });
            const isFirstMessage = history.length === 0;
            prisma.message.create({ data: { role: 'user', content: prompt, sessionId } })
                .catch(console.error);
            prisma.session.update({
                where: { id: sessionId },
                data: isFirstMessage
                    ? { title: prompt.slice(0, 60).trim(), updatedAt: new Date() }
                    : { updatedAt: new Date() },
            }).catch(console.error);
        }
        const stream = await openRouter.chat.send({
            chatGenerationParams: {
                model: 'arcee-ai/trinity-large-preview:free',
                stream: true,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
                    { role: 'user', content: prompt },
                ],
            },
        });

        let fullContent = '';
        for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content;
            if (token) {
                fullContent += token;
                res.write(`data: ${JSON.stringify({ content: token })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
        if (isAuthed && fullContent) {
            prisma.message.create({ data: { role: 'assistant', content: fullContent, sessionId } })
                .catch(console.error);
        }
    } catch (error) {
        console.error('Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.write(`data: ${JSON.stringify({ error: 'Failed' })}\n\n`);
            res.end();
        }
    }
});

app.listen(3000, () => console.log('Listening on port 3000'));

