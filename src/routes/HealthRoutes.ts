import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ message: 'api funcionando!' });
});

export default router;
