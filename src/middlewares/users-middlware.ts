import { Request, Response, NextFunction } from 'express';

function checkAuthentication(req: Request, res: Response, next: NextFunction): void {
    if (req.session && req.query.userId) {
        next();  // L'utilisateur est authentifié, continuer au prochain middleware ou route
    } else {
        res.status(401).json({ error: 'Vous devez être connecté pour accéder à cette ressource' });  // Sinon, retourner une erreur 401
    }
}

export {checkAuthentication}
