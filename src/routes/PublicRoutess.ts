import { Router } from 'express';
import { prisma } from '../db/client';

const router = Router();

router.get('/public/current-assembly', async (_req, res) => {
    const a = await prisma.assembly.findFirst({ orderBy: { createdAt: 'desc' } });
    res.json(a ?? null);
});

// item “aberto” ainda não modelado; devolver null por enquanto
router.get('/public/current-item', async (_req, res) => {
    res.json(null);
});

export default router;
