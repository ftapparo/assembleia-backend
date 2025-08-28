import { Request, Response } from 'express';
import { rollCallService } from '../services/credentialService';
import { unitsService } from '../services/unitService';

export const credentialController = {
    listUnits: (_req: Request, res: Response) => {
        res.json(unitsService.list());
    },

    getUnitPIN: (req: Request, res: Response) => {
        const { block, unit } = req.query;
        if (!block || !unit) {
            return res.status(400).json({ ok: false, error: 'block e unit são obrigatórios' });
        }
        try {
            const info = rollCallService.getUnitInfo(String(block), String(unit));
            if (!info) return res.status(404).json({ ok: false, error: 'Unidade não encontrada' });
            res.json(info);
        } catch (e: any) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },

    getLookup: (req: Request, res: Response) => {
        const { block, unit } = req.query;
        if (!block || !unit) {
            return res.status(400).json({ ok: false, error: 'block e unit são obrigatórios' });
        }
        try {
            const info = rollCallService.getLookupInfo(String(block), String(unit));
            res.json(info);
        } catch (e: any) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },

    markPresent: (req: Request, res: Response) => {
        const { block, unit } = req.body;
        if (!block || !unit) {
            return res.status(400).json({ ok: false, error: 'block e unit são obrigatórios' });
        }
        try {
            const attendee = rollCallService.markPresent(block, unit);
            res.json({ ok: true, attendee });
        } catch (e: any) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },

    linkUnit: (req: Request, res: Response) => {
        const { attendeeId, block, unit, relation } = req.body;
        if (!attendeeId || !block || !unit || !relation) {
            return res.status(400).json({ ok: false, error: 'attendeeId, block, unit e relation são obrigatórios' });
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
