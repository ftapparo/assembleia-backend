import { Request, Response } from 'express';
import { state } from '../services/assemblyService';
import { rollCallService } from '../services/credentialService';

type Emitter = (assemblyId: string, event: string, payload?: any) => void;

export function createAdminController(emit?: Emitter) {
    const assemblyId = state.assembly.id;

    return {
        getAssembly: (_req: Request, res: Response) => {
            res.json({
                assembly: state.assembly,
                items: state.items,
                currentItem: state.currentItem
            });
        },

        // dentro do createAdminController
        startAssembly: (_req: Request, res: Response) => {
            state.startAssembly();
            // atualiza status do roll_call.json
            rollCallService.initHeader(state.assembly);

            emit?.(assemblyId, 'assembly.started', state.assembly);
            res.json({ ok: true, assembly: state.assembly });
        },

        closeAssembly: (_req: Request, res: Response) => {
            state.closeAssembly();
            // sincroniza status também
            rollCallService.updateStatus(state.assembly.status);

            emit?.(assemblyId, 'assembly.closed', state.assembly);
            res.json({ ok: true, assembly: state.assembly });
        },

        openItem: (req: Request, res: Response) => {
            const orderNo = Number(req.params.orderNo);
            try {
                state.openItem(orderNo);
                emit?.(assemblyId, 'item.opened', { orderNo });
                res.json({ ok: true, currentItem: state.currentItem });
            } catch (e: any) {
                res.status(400).json({ ok: false, error: e.message });
            }
        },

        closeItem: (req: Request, res: Response) => {
            const orderNo = Number(req.params.orderNo);
            try {
                state.closeItem(orderNo);
                emit?.(assemblyId, 'item.closed', { orderNo });
                res.json({ ok: true });
            } catch (e: any) {
                res.status(400).json({ ok: false, error: e.message });
            }
        },

        voidItem: (req: Request, res: Response) => {
            const orderNo = Number(req.params.orderNo);
            try {
                state.voidItem(orderNo);
                emit?.(assemblyId, 'item.removed', { orderNo });
                res.json({ ok: true });
            } catch (e: any) {
                res.status(400).json({ ok: false, error: e.message });
            }
        }
    };
}
