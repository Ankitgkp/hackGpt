import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from './db.js';
import { signToken } from './middleware.js';
const router = Router();

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;

    if (!username?.trim() || !email?.trim() || !password) {
        res.status(400).json({ message: 'All fields are required' });
        return;
    }
    if (username.trim().length < 3) {
        res.status(400).json({ message: 'Username must be at least 3 characters' });
        return;
    }
    if (!isValidEmail(email)) {
        res.status(400).json({ message: 'Invalid email address' });
        return;
    }
    if (password.length < 8) {
        res.status(400).json({ message: 'Password must be at least 8 characters' });
        return;
    }

    try {
        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });
        if (existing) {
            const field = existing.email === email ? 'Email' : 'Username';
            res.status(409).json({ message: `${field} is already taken` });
            return;
        }

        const hashed = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { username: username.trim(), email: email.toLowerCase().trim(), password: hashed },
        });

        const token = signToken(user.id);
        res.status(201).json({
            token,
            user: { id: user.id, username: user.username, email: user.email },
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Failed to create account' });
    }
});
router.post('/signin', async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const token = signToken(user.id);
        res.json({
            token,
            user: { id: user.id, username: user.username, email: user.email },
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ message: 'Failed to sign in' });
    }
});

export default router;
