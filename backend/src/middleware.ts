import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || "";

export interface AuthRequest extends Request {
    userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
        req.userId = payload.userId;
        next();
    } catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
            req.userId = payload.userId;
        } catch {
            console.log("token incorrect");
        }
    }
    next();
}

export function signToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
