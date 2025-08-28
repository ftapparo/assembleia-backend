import { Request, Response } from 'express';
import { state } from '../services/assemblyService';
import { rollCallService } from '../services/credentialService';
import { voteService } from '../services/voteService';

export const voteController = {
    /** POST /api/vote/access  => body: { block, unit, pin  } */
    access: (req: Request, res: Response) => {
        const { block, unit, pin } = req.body || {};
        try {
            if (state.assembly.status === 'closed') {
                return res.status(400).json({ ok: false, error: 'Assembleia encerrada' });
            }
            if (!block || !unit || !pin) {
                return res.status(400).json({ ok: false, error: 'block, unit e pin são obrigatórios' });
            }
            const result = rollCallService.markAccess(block, unit, pin);
            res.json({ ok: true, content: result });
        } catch (e: any) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },

    /** POST /api/vote/cast => body: { attendeeId, itemOrder, choice } */
    cast: (req: Request, res: Response) => {
        const { attendeeId, choice, itemOrderNo } = req.body || {};

        try {
            if (state.assembly.status === 'closed') {
                return res.status(400).json({ ok: false, error: 'Assembleia encerrada' });
            }
            if (!attendeeId || !itemOrderNo || !choice) {
                return res.status(400).json({ ok: false, error: 'attendeeId, itemOrderNo e choice são obrigatórios' });
            }

            // já votou neste item?
            if (voteService.hasVoted(attendeeId, Number(itemOrderNo))) {
                return res.status(400).json({ ok: false, error: 'Voto já registrado para este item' });
            }

            const rec = voteService.cast(attendeeId, Number(itemOrderNo), choice);
            res.json({ ok: true, voteId: rec.id, createdAt: rec.createdAt });
        } catch (e: any) {
            res.status(400).json({ ok: false, error: e.message });
        }
    }
};
