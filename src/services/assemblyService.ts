import fs from 'fs';
import path from 'path';
import { finalizeOnClose } from './voteService';

export type QuorumType = 'simples' | 'qualificado';
export type ComputeType = 'simples' | 'fracao';
export type VoteType = 'direto' | 'selecao';
export type ItemStatus = 'pending' | 'open' | 'closed' | 'void';
export type AssemblyStatus = 'idle' | 'started' | 'closed';

export interface Item {
    order_no: number;
    title: string;
    description: string;
    quorum_type: QuorumType;
    quorum_value?: number;
    compute: ComputeType;
    vote_type: VoteType;
    multiple: boolean;
    permanent: boolean;
    status: ItemStatus;

    // NOVOS CAMPOS
    votingStartedAt?: string;
    votingEndedAt?: string;
    results?: {
        totals: Record<string, { count: number; weight: number }>;
        totalCount: number;
        totalWeight: number;
    };
}

export interface Assembly {
    id: string;
    title: string;
    date: string;       // ISO
    location?: string;
    notes?: string;
    status: AssemblyStatus;
    startedAt?: string;
    endedAt?: string;
}

type AssemblyFile = {
    assembly: Omit<Assembly, 'id' | 'status' | 'startedAt' | 'endedAt'>;
    items: Omit<Item, 'status'>[];
};

type PersistedState = {
    assembly: Assembly;
    items: Item[];
    currentItem?: number; // order_no do item aberto
};

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DEFINITION_FILE = path.join(DATA_DIR, 'assembly_items.json');
const STATE_FILE = path.join(DATA_DIR, 'assembly_state.json');

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadDefinition(): AssemblyFile {
    ensureDataDir();
    if (!fs.existsSync(DEFINITION_FILE)) {
        throw new Error(`Arquivo de definição não encontrado: ${DEFINITION_FILE}`);
    }
    const raw = fs.readFileSync(DEFINITION_FILE, 'utf-8');
    return JSON.parse(raw) as AssemblyFile;
}

function initStateFromDefinition(): PersistedState {
    const def = loadDefinition();

    const assembly: Assembly = {
        id: 'nova-residence-2025-08-28',
        title: def.assembly.title,
        date: def.assembly.date,
        location: def.assembly.location,
        notes: def.assembly.notes,
        status: 'idle'
    };

    const items: Item[] = def.items.map((i) => ({
        ...i,
        status: 'pending'
    }));

    return { assembly, items, currentItem: undefined };
}

function readState(): PersistedState {
    ensureDataDir();
    if (!fs.existsSync(STATE_FILE)) {
        const initial = initStateFromDefinition();
        fs.writeFileSync(STATE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
        return initial;
    }
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    return JSON.parse(raw) as PersistedState;
}

function writeState(state: PersistedState) {
    ensureDataDir();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

class AssemblyService {
    getState() {
        return readState();
    }

    get assembly() {
        return this.getState().assembly;
    }

    get items() {
        return this.getState().items;
    }

    get currentItem() {
        return this.getState().currentItem;
    }

    startAssembly() {
        const s = readState();
        if (s.assembly.status !== 'idle') return;
        s.assembly.status = 'started';
        s.assembly.startedAt = new Date().toISOString();
        writeState(s);
    }

    closeAssembly() {
        const s = readState();
        if (s.assembly.status !== 'started') return;

        // fecha item aberto, se houver
        if (s.currentItem != null) {
            const idx = s.items.findIndex(i => i.order_no === s.currentItem);
            if (idx >= 0 && s.items[idx].status === 'open') {
                s.items[idx].status = 'closed';
            }
            s.currentItem = undefined;
        }

        s.assembly.status = 'closed';
        s.assembly.endedAt = new Date().toISOString();
        writeState(s);
    }

    openItem(orderNo: number) {
        const s = readState();
        if (s.assembly.status === 'closed') throw new Error('Assembleia encerrada');

        const idx = s.items.findIndex(i => i.order_no === orderNo);
        if (idx < 0) throw new Error('Item não encontrado');
        if (s.items[idx].status === 'void') throw new Error('Item anulado');

        // se já houver item aberto, retorna erro
        if (s.currentItem != null) {
            throw new Error('Já existe um item aberto');
        }

        s.items[idx].status = 'open';
        s.items[idx].votingStartedAt = new Date().toISOString();
        s.currentItem = orderNo;
        writeState(s);
    }

    closeItem(orderNo: number) {
        const s = readState();
        const idx = s.items.findIndex(i => i.order_no === orderNo);
        if (idx < 0) throw new Error('Item não encontrado');

        s.items[idx].status = 'closed';
        s.items[idx].votingEndedAt = new Date().toISOString();
        if (s.currentItem === orderNo) s.currentItem = undefined;

        writeState(s);

        // IMPORTANTE: computa abstenções implícitas e fixa o resultado final
        finalizeOnClose(orderNo);
    }

    voidItem(orderNo: number) {
        const s = readState();
        const idx = s.items.findIndex(i => i.order_no === orderNo);
        if (idx < 0) throw new Error('Item não encontrado');

        // se estiver aberto, fecha
        if (s.items[idx].status === 'open') {
            s.items[idx].status = 'closed';
            if (s.currentItem === orderNo) s.currentItem = undefined;
        }

        s.items[idx].status = 'void';
        writeState(s);
    }
}

// Singleton
export const state = new AssemblyService();
