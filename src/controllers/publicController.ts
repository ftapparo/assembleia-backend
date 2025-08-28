// src/controllers/publicController.ts
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { state } from '../services/assemblyService';
import { rollCallService } from '../services/credentialService';

type Totals = Record<string, { count: number; weight: number }>;

const DATA_DIR = path.resolve(process.cwd(), 'data');
const VOTES_FILE = path.join(DATA_DIR, 'units_votes.json');

/** Agrega votos ao vivo a partir do arquivo units_votes.json */
function readLiveAggregate(assemblyId: string, itemOrderNo: number) {
    try {
        if (!fs.existsSync(VOTES_FILE)) {
            return { totals: {} as Totals, totalCount: 0, totalWeight: 0 };
        }
        const raw = fs.readFileSync(VOTES_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as {
            votes: Array<{
                assemblyId: string;
                item_order_no: number;
                choice: number;
                weight: number;
            }>
        };

        const votes = (parsed.votes || []).filter(
            v => v.assemblyId === assemblyId && v.item_order_no === itemOrderNo
        );

        const totals: Totals = {};
        let totalCount = 0;
        let totalWeight = 0;

        for (const v of votes) {
            const key = String(v.choice); // normaliza a chave
            if (!totals[key]) totals[key] = { count: 0, weight: 0 };
            totals[key].count += 1;
            totals[key].weight += Number(v.weight || 0);
            totalCount += 1;
            totalWeight += Number(v.weight || 0);
        }

        return { totals, totalCount, totalWeight };
    } catch (e) {
        // Em caso de erro, devolve zeros para não quebrar a UI
        return { totals: {} as Totals, totalCount: 0, totalWeight: 0 };
    }
}

export const publicController = {
    status: (_req: Request, res: Response) => {
        // SEMPRE ler o snapshot atual do estado
        const snapshot = state.getState();
        const a = snapshot.assembly;
        const items = snapshot.items || [];

        // item aberto atual
        const openItem = items.find(i => i.status === 'open');

        // se não existe item aberto, pega o último fechado
        let showItem = openItem;
        if (!showItem) {
            showItem = [...items]
                .filter(i => i.status === 'closed')
                .sort((x, y) =>
                    new Date(y.votingEndedAt || 0).getTime() - new Date(x.votingEndedAt || 0).getTime()
                )[0];
        }

        let current: any = null;
        if (showItem) {
            // resultados:
            // - se aberto: agrega ao vivo do arquivo de votos
            // - se fechado: prioriza resultado congelado; se não houver, agrega ao vivo
            const liveAgg = readLiveAggregate(a.id, showItem.order_no);
            const results =
                showItem.status === 'open'
                    ? liveAgg
                    : (showItem.results ?? liveAgg);

            current = {
                order_no: showItem.order_no,
                title: showItem.title,
                description: showItem.description,
                status: showItem.status, // "open" ou "closed"
                vote_type: showItem.vote_type,
                compute: showItem.compute,
                votingStartedAt: showItem.votingStartedAt,
                votingEndedAt: showItem.votingEndedAt,
                results: results || { totals: {}, totalCount: 0, totalWeight: 0 },
            };
        }

        const presentCount = rollCallService.listAttendees().length;

        res.json({
            assembly: {
                id: a.id,
                title: a.title,
                date: a.date,
                status: a.status,
                startedAt: a.startedAt,
                endedAt: a.endedAt,
            },
            currentItem: current, // pode ser "closed" (último encerrado) ou null
            presentCount,
        });
    }
};
