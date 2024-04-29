import { Request, Response, NextFunction } from 'express';

export function checkAuthentication(req: Request, res: Response, next: NextFunction): void {
    if (req.session && req.session.cookie) {
        next();
    } else {
        res.status(401).send('Non autorisé: Vous devez être connecté.');
    }
}
