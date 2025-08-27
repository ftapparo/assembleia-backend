import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de autenticação para rotas administrativas.
 *
 * Verifica se o header Authorization contém o token correto definido em ADMIN_PASSWORD.
 * Caso contrário, retorna 401 Unauthorized.
 *
 * @param {Request} req - Objeto de requisição do Express
 * @param {Response} res - Objeto de resposta do Express
 * @param {NextFunction} next - Função para passar para o próximo middleware
 */
export function adminAuth(req: Request, res: Response, next: NextFunction) {
    const hdr = req.headers['authorization'] || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
    if (!token || token !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'unauthorized' });
    }
    next();
}
