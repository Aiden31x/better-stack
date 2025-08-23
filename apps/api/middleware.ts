import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header missing or invalid' });
    }

    try {
        const token = header.substring(7); // Remove 'Bearer ' prefix
        let data = jwt.verify(token, process.env.JWT_SECRET!);
        req.userId = data.sub as string;
        next();
    } catch (e) {
        console.log('JWT verification error:', e);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}