// src/services/vote.service.ts
import fs from 'fs';
import path from 'path';
import lockfile from 'proper-lockfile';
import { state } from './assemblyService';
import { rollCallService } from './credentialService';

export type VoteRecord = {
    id: string;
    assemblyId: string;
    item_order_no: number;
    attendeeId: string;
    block: string;
    unit: string;
    choice: number;
    weight: number;
    createdAt: string;
};

type VotesFile = { votes: VoteRecord[] };

const DATA_DIR = path.resolve(process.cwd(), 'data');
const VOTES_FILE = path.join(DATA_DIR, 'units_votes.json');
const STATE_FILE = path.join(DATA_DIR, 'assembly_state.json');

function cuid() {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function ensureVotesFile(): VotesFile {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(VOTES_FILE)) {
        const initial: VotesFile = { votes: [] };
        fs.writeFileSync(VOTES_FILE, JSON.stringify(initial, null, 2), 'utf-8');
        return initial;
    }
    const raw = fs.readFileSync(VOTES_FILE, 'utf-8');
    return JSON.parse(raw) as VotesFile;
}

async function writeVotes(data: VotesFile) {
    let release: (() => Promise<void>) | undefined;
    try {
        release = await lockfile.lock(VOTES_FILE, {
            retries: {
                retries: 20,
                factor: 1,
                minTimeout: 100,
                maxTimeout: 100
            }
        });
        fs.writeFileSync(VOTES_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } finally {
        if (release) await release();
    }
}

function computeAttendeeWeight(attendeeId: string, computeMode: 'simples' | 'fracao') {
    const rc = rollCallService.read();
    const a = rc.attendees.find(x => x.attendeeId === attendeeId);
    if (!a) throw new Error('Attendee não encontrado');

    if (computeMode === 'simples') return 1.0;

    const linkedSum = (a.linked_units || []).reduce((acc, u) => acc + (u.fraction || 0), 0);
    const total = (a.fraction || 0) + linkedSum;
    return total;
}

function aggregateItem(itemOrderNo: number) {
    const s = state.getState();
    const file = ensureVotesFile();
    const votes = file.votes.filter(
        v => v.assemblyId === s.assembly.id && v.item_order_no === itemOrderNo
    );

    const totals: Record<string, { count: number; weight: number }> = {};
    let totalCount = 0;
    let totalWeight = 0;

    for (const v of votes) {
        const key = String(v.choice); // normaliza a chave
        if (!totals[key]) totals[key] = { count: 0, weight: 0 };
        totals[key].count += 1;
        totals[key].weight += v.weight;
        totalCount += 1;
        totalWeight += v.weight;
    }

    return { totals, totalCount, totalWeight };
}

export function recomputeItemResults(itemOrderNo: number) {
    const s = state.getState();
    const item = s.items.find(i => i.order_no === itemOrderNo);
    if (!item) throw new Error('Item não encontrado');

    const agg = aggregateItem(itemOrderNo);
    item.results = agg;

    // GRAVA O SNAPSHOT ALTERADO (s), não um novo getState()
    fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2), 'utf-8');
}

export function finalizeOnClose(itemOrderNo: number) {
    const s = state.getState();
    const item = s.items.find(i => i.order_no === itemOrderNo);
    if (!item) throw new Error('Item não encontrado');

    const agg = aggregateItem(itemOrderNo);
    item.results = agg;

    fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2), 'utf-8');
}

export const voteService = {
    hasVoted(attendeeId: string, itemOrderNo: number) {
        const assemblyId = state.getState().assembly.id; // corrigido
        const f = ensureVotesFile();
        return f.votes.some(
            v => v.assemblyId === assemblyId && v.item_order_no === itemOrderNo && v.attendeeId === attendeeId
        );
    },

    async cast(attendeeId: string, itemOrderNo: number, choice: number) {
        const s = state.getState();
        const item = s.items.find(i => i.order_no === itemOrderNo);
        if (!item) throw new Error('Item não encontrado');
        if (item.status !== 'open') throw new Error('Votação não está aberta para este item');

        // validar presença e acesso
        const rc = rollCallService.read();
        if (rc.header && rc.header.status === 'closed') {
            throw new Error('Assembleia encerrada');
        }

        const attendee = rc.attendees.find(a => a.attendeeId === attendeeId);
        if (!attendee) throw new Error('Attendee não encontrado na lista de presença');
        if (attendee.accessStatus !== 'accessed') {
            throw new Error('Acesso não validado. Faça login com bloco/unidade/código no seu celular.');
        }

        // impedir voto duplicado do mesmo attendee no mesmo item
        const assemblyId = s.assembly.id;
        const already = ensureVotesFile().votes.find(
            v => v.assemblyId === assemblyId && v.item_order_no === itemOrderNo && v.attendeeId === attendeeId
        );
        if (already) throw new Error('Voto já registrado para este item.');

        // voto direto: 1|2
        const ch = Number(choice);
        if (item.vote_type === 'direto' && ![1, 2].includes(ch)) {
            throw new Error('Opção inválida. Para voto direto use 1 (SIM), 2 (NÃO).');
        }

        const f = ensureVotesFile();

        // peso por unidade
        const unitWeight = (fraction?: number) =>
            item.compute === 'simples' ? 1.0 : Number(fraction || 0);

        const nowISO = new Date().toISOString();

        // 1) unidade principal
        const mainRec: VoteRecord = {
            id: cuid(),
            assemblyId,
            item_order_no: itemOrderNo,
            attendeeId: attendee.attendeeId,
            block: attendee.block,
            unit: String(attendee.unit),
            choice: ch,
            weight: unitWeight(attendee.fraction),
            createdAt: nowISO
        };
        f.votes.push(mainRec);

        // 2) vinculadas (procuração/vaga extra)
        for (const link of (attendee.linked_units || [])) {
            const rec: VoteRecord = {
                id: cuid(),
                assemblyId,
                item_order_no: itemOrderNo,
                attendeeId: attendee.attendeeId,
                block: link.block,
                unit: String(link.unit),
                choice: ch,
                weight: unitWeight(link.fraction),
                createdAt: nowISO
            };
            f.votes.push(rec);
        }

        // persiste votos com lock e retries
        await writeVotes(f);

        // atualiza agregados (sem abstenções implícitas ainda)
        recomputeItemResults(itemOrderNo);

        return mainRec;
    },

    recompute: (itemOrderNo: number) => recomputeItemResults(itemOrderNo)
};
