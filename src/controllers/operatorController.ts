import { Request, Response } from 'express';
import { rollCallService } from '../services/credentialService';
import { unitsService } from '../services/unitService';

export const opsController = {
    listUnits: (_req: Request, res: Response) => {
        res.json(unitsService.list());
    },

    getUnitCode: (req: Request, res: Response) => {
        const { block, unit } = req.params;
        try {
            const info = rollCallService.getUnitInfo(block, unit);
            if (!info) return res.status(404).json({ ok: false, error: 'Unidade não encontrada' });
            res.json(info);
        } catch (e: any) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },

    markPresent: (req: Request, res: Response) => {
        const { attendeeId } = req.body;
        if (!attendeeId) {
            return res.status(400).json({ ok: false, error: 'attendeeId é obrigatório' });
        }
        try {
            const attendee = rollCallService.markPresent(attendeeId);
            res.json({ ok: true, attendee });
        } catch (e: any) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },

    linkUnit: (req: Request, res: Response) => {
        const { attendeeId } = req.params;
        const { block, unit, relation } = req.body;
        if (!block || !unit || !relation) {
            return res.status(400).json({ ok: false, error: 'block, unit e relation são obrigatórios' });
        }
        try {
            const result = rollCallService.linkUnit(attendeeId, block, unit, relation);
            res.json({ ok: true, ...result });
        } catch (e: any) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },

    listRollCall: (_req: Request, res: Response) => {
        try {
            const list = rollCallService.listAttendees();
            res.json(list);
        } catch (e: any) {
            res.status(400).json({ ok: false, error: e.message });
        }
    }
};
