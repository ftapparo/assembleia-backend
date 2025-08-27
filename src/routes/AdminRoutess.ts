import { Router } from 'express';
import { prisma } from '../db/client';
import { adminAuth } from '../middlewares/adminAuth';

const router = Router();
router.use(adminAuth);

// criar assembleia
router.post('/assemblies', async (req, res) => {
    const { title } = req.body;
    const a = await prisma.assembly.create({ data: { title } });
    res.json(a);
});

// iniciar/encerrar assembleia
router.post('/assemblies/:id/start', async (req, res) => {
    const a = await prisma.assembly.update({
        where: { id: req.params.id },
        data: { status: 'started', startedAt: new Date() }
    });
    res.json(a);
});
router.post('/assemblies/:id/close', async (req, res) => {
    const a = await prisma.assembly.update({
        where: { id: req.params.id },
        data: { status: 'closed', endedAt: new Date() }
    });
    res.json(a);
});

// criar item
router.post('/items', async (req, res) => {
    const { assemblyId, orderNo, title, description, quorumType, quorumValue, compute, voteType, multiple } = req.body;
    const it = await prisma.item.create({
        data: { assemblyId, orderNo, title, description, quorumType, quorumValue, compute, voteType, multiple: !!multiple }
    });
    res.json(it);
});

export default router;
