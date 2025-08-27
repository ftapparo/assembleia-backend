import fs from 'fs';
import path from 'path';
import { state } from './assemblyService';
import { rollCallService } from './credentialService';

export type VoteRecord = {
    id: string;
    assemblyId: string;
    item_order_no: number;
    attendeeId: string;
    block: string;       // NOVO
    unit: string;        // NOVO
    choice: string;
    weight: number;
    createdAt: string;
};

type VotesFile = {
    votes: VoteRecord[];
};

const DATA_DIR = path.resolve(process.cwd(), 'data');
const VOTES_FILE = path.join(DATA_DIR, 'units_votes.json');

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

function writeVotes(data: VotesFile) {
    fs.writeFileSync(VOTES_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/** Soma frações do attendee (principal + vinculadas) */
function computeAttendeeWeight(attendeeId: string, computeMode: 'simples' | 'fracao') {
    const rc = rollCallService.read();
    const a = rc.attendees.find(x => x.attendeeId === attendeeId);
    if (!a) throw new Error('Attendee não encontrado');

    if (computeMode === 'simples') return 1.0;

    const linkedSum = (a.linked_units || []).reduce((acc, u) => acc + (u.fraction || 0), 0);
    const total = (a.fraction || 0) + linkedSum;
    return total; // já é a fração ideal total do conjunto
}

function recomputeItemResults(itemOrderNo: number) {
    const votesFile = ensureVotesFile();
    const s = state.getState();
    const item = s.items.find(i => i.order_no === itemOrderNo);
    if (!item) throw new Error('Item não encontrado');

    const votes = votesFile.votes.filter(v => v.assemblyId === s.assembly.id && v.item_order_no === itemOrderNo);

    const totals: Record<string, { count: number; weight: number }> = {};
    let totalCount = 0;
    let totalWeight = 0;

    for (const v of votes) {
        if (!totals[v.choice]) totals[v.choice] = { count: 0, weight: 0 };
        totals[v.choice].count += 1;
        totals[v.choice].weight += v.weight;
        totalCount += 1;
        totalWeight += v.weight;
    }

    item.results = { totals, totalCount, totalWeight };
    // persiste em assembly-state.json
    const newState = state.getState();
    const idx = newState.items.findIndex(i => i.order_no === itemOrderNo);
    if (idx >= 0) {
        newState.items[idx] = item;
        // grava arquivo
        const statePath = path.join(DATA_DIR, 'assembly_state.json');
        fs.writeFileSync(statePath, JSON.stringify(newState, null, 2), 'utf-8');
    }
}

export const voteService = {
    /** Verifica se já votou neste item */
    hasVoted(attendeeId: string, itemOrderNo: number) {
        const f = ensureVotesFile();
        return f.votes.some(v => v.assemblyId === state.assembly.id && v.item_order_no === itemOrderNo && v.attendeeId === attendeeId);
    },

    /** Registra voto e atualiza resultado */
    cast(attendeeId: string, itemOrderNo: number, choice: string) {
        const s = state.getState();
        const item = s.items.find(i => i.order_no === itemOrderNo);
        if (!item) throw new Error('Item não encontrado');
        if (item.status !== 'open') throw new Error('Votação não está aberta para este item');

        // validar se attendee está presente na lista de presença
        const rc = rollCallService.read();
        const attendee = rc.attendees.find(a => a.attendeeId === attendeeId);
        if (!attendee) throw new Error('Attendee não encontrado na lista de presença');

        const f = ensureVotesFile();

        // helper para peso por unidade
        const unitWeight = (fraction?: number) =>
            item.compute === 'simples' ? 1.0 : Number(fraction || 0);

        const nowISO = new Date().toISOString();
        const ch = String(choice).toUpperCase();

        // 1) voto da UNIDADE PRINCIPAL
        const mainRec: VoteRecord = {
            id: cuid(),
            assemblyId: s.assembly.id,
            item_order_no: itemOrderNo,
            attendeeId: attendee.attendeeId,
            block: attendee.block,
            unit: String(attendee.unit),
            choice: ch,
            weight: unitWeight(attendee.fraction),
            createdAt: nowISO
        };
        f.votes.push(mainRec);

        // 2) votos das UNIDADES VINCULADAS (procuração/vaga extra), todos com a MESMA escolha
        for (const link of (attendee.linked_units || [])) {
            const rec: VoteRecord = {
                id: cuid(),
                assemblyId: s.assembly.id,
                item_order_no: itemOrderNo,
                attendeeId: attendee.attendeeId,      // mantém referência ao mesmo attendee
                block: link.block,
                unit: String(link.unit),
                choice: ch,
                weight: unitWeight(link.fraction),
                createdAt: nowISO
            };
            f.votes.push(rec);
        }

        // persiste arquivo de votos
        writeVotes(f);

        // atualiza resultados agregados do item (somatório dos pesos dos N registros)
        recomputeItemResults(itemOrderNo);

        // retorna o registro principal (compatibilidade com chamadas existentes)
        return mainRec;
    },

    /** Recalcula resultados de um item (pode ser chamado ao fechar) */
    recompute: (itemOrderNo: number) => recomputeItemResults(itemOrderNo)
};
