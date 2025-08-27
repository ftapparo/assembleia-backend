import { Request, Response } from 'express';
import { state } from '../services/assemblyService';
import { rollCallService } from '../services/credentialService';
import { voteService } from '../services/voteService';

export const voteController = {
    /** POST /api/vote/access  => body: { block, unit, code } */
    access: (req: Request, res: Response) => {
        const { block, unit, code } = req.body || {};
        try {
            if (state.assembly.status !== 'started') {
                return res.status(400).json({ ok: false, error: 'Assembleia não iniciada' });
            }
            if (!block || !unit || !code) {
                return res.status(400).json({ ok: false, error: 'block, unit e code são obrigatórios' });
            }
            const attendee = rollCallService.markAccess(block, unit, code);
            // Retorne apenas um token anônimo (attendeeId) para a sessão
            res.json({ ok: true, attendeeId: attendee.attendeeId, accessedAt: attendee.accessedAt });
        } catch (e: any) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },

    /** POST /api/vote/cast => body: { attendeeId, itemOrder, choice } */
    cast: (req: Request, res: Response) => {
        const { attendeeId, itemOrder, choice } = req.body || {};
        try {
            if (state.assembly.status !== 'started') {
                return res.status(400).json({ ok: false, error: 'Assembleia não iniciada' });
            }
            if (!attendeeId || !itemOrder || !choice) {
                return res.status(400).json({ ok: false, error: 'attendeeId, itemOrder e choice são obrigatórios' });
            }

            // já votou neste item?
            if (voteService.hasVoted(attendeeId, Number(itemOrder))) {
                return res.status(400).json({ ok: false, error: 'Voto já registrado para este item' });
            }

            const rec = voteService.cast(attendeeId, Number(itemOrder), String(choice));
            res.json({ ok: true, voteId: rec.id, createdAt: rec.createdAt });
        } catch (e: any) {
            res.status(400).json({ ok: false, error: e.message });
        }
    }
};
