import { Request, Response } from 'express';
import { state } from '../services/assemblyService';

export const publicController = {
    /** GET /api/public/status
     * Retorna status da assembleia + item atual (se houver) + resultados agregados
     */
    status: (_req: Request, res: Response) => {
        const a = state.assembly;
        const currentOrder = state.currentItem;
        const items = state.items;

        let current: any = null;
        if (currentOrder != null) {
            const item = items.find(i => i.order_no === currentOrder);
            if (item) {
                current = {
                    order_no: item.order_no,
                    title: item.title,
                    description: item.description,
                    status: item.status,                 // 'open'
                    vote_type: item.vote_type,
                    compute: item.compute,
                    votingStartedAt: item.votingStartedAt,
                    results: item.results ?? {
                        totals: {},
                        totalCount: 0,
                        totalWeight: 0
                    }
                };
            }
        }

        res.json({
            assembly: {
                id: a.id,
                title: a.title,
                date: a.date,
                status: a.status,
                startedAt: a.startedAt,
                endedAt: a.endedAt
            },
            currentItem: current
        });
    }
};
