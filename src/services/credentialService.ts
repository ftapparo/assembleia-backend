import fs from 'fs';
import path from 'path';
import { UnitsService, unitsService, UnitRecord } from './unitService';
import { Assembly } from './assemblyService';

export type LinkedUnit = {
    block: string;
    unit: string;
    code: string;
    fraction: number;
    relation: 'procuracao' | 'vaga_extra' | 'outra';
};

export type Attendee = {
    attendeeId: string;
    block: string;
    unit: string;
    code: string;
    fraction: number;
    arrivedAt: string; // ISO timestamp
    linked_units: LinkedUnit[];
};

type RollCallFile = {
    header: {
        assemblyId: string;
        title: string;
        date: string;
        createdAt: string;
        status: string; // idle|started|closed
    } | null;
    attendees: Attendee[];
};

const DATA_DIR = path.resolve(process.cwd(), 'data');
const ROLL_FILE = path.join(DATA_DIR, 'roll_call.json');

function cuid() {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export class RollCallService {
    private units: UnitsService;

    constructor(unitsSvc: UnitsService) {
        this.units = unitsSvc;
    }

    private ensureFile() {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        if (!fs.existsSync(ROLL_FILE)) {
            fs.writeFileSync(
                ROLL_FILE,
                JSON.stringify({ header: null, attendees: [] }, null, 2),
                'utf-8'
            );
        }
    }

    read(): RollCallFile {
        this.ensureFile();
        const raw = fs.readFileSync(ROLL_FILE, 'utf-8');
        return JSON.parse(raw) as RollCallFile;
    }

    write(data: RollCallFile) {
        this.ensureFile();
        fs.writeFileSync(ROLL_FILE, JSON.stringify(data, null, 2), 'utf-8');
    }

    initHeader(assembly: Assembly) {
        const curr: RollCallFile = {
            header: {
                assemblyId: assembly.id,
                title: assembly.title,
                date: assembly.date,
                createdAt: new Date().toISOString(),
                status: assembly.status
            },
            attendees: []
        };
        this.write(curr);
    }

    updateStatus(status: string) {
        const file = this.read();
        if (!file.header) throw new Error('Nenhuma assembleia carregada no roll_call.json');
        file.header.status = status;
        this.write(file);
    }

    listAttendees() {
        return this.read().attendees;
    }

    getUnitInfo(block: string, unit: string | number): UnitRecord | undefined {
        return this.units.findByBlockUnit(block, unit);
    }

    markPresent(attendeeId: number) {
        const file = this.read();
        if (!file.header || file.header.status !== 'started') {
            throw new Error('Assembleia não está aberta para credenciamento');
        }
        const u = this.units.findById(attendeeId);
        if (!u) throw new Error('Unidade não encontrada');

        // Verifica se já existe presença para o mesmo bloco e unidade
        const jaPresente = file.attendees.some(a => a.block === String(u.block) && a.unit === String(u.unit));
        if (jaPresente) throw new Error('Unidade já marcada como presente');

        const attendee: Attendee = {
            attendeeId: cuid(),
            block: String(u.block),
            unit: String(u.unit),
            code: u.code,
            fraction: u.fraction,
            arrivedAt: new Date().toISOString(),
            linked_units: []
        };

        file.attendees.push(attendee);
        this.write(file);
        return attendee;
    }

    linkUnit(attendeeId: string, block: string, unit: string | number, relation: LinkedUnit['relation']) {
        const file = this.read();
        if (!file.header || file.header.status !== 'started') {
            throw new Error('Assembleia não está aberta para vinculação');
        }
        const idx = file.attendees.findIndex(a => a.attendeeId === attendeeId);
        if (idx < 0) throw new Error('Attendee não encontrado');

        const u = this.units.findByBlockUnit(block, unit);
        if (!u) throw new Error('Unidade (vínculo) não encontrada');

        // Não permitir se unidade já consta como presente
        const jaPresente = file.attendees.some(a => a.block === String(u.block) && a.unit === String(u.unit));
        if (jaPresente) throw new Error('Unidade já marcada como presente ou vinculada');

        // Não permitir se unidade já está vinculada a qualquer attendee
        const jaVinculada = file.attendees.some(a => a.linked_units.some(l => l.block === String(u.block) && l.unit === String(u.unit)));
        if (jaVinculada) throw new Error('Unidade já vinculada a um participante');

        const link: LinkedUnit = {
            block: String(u.block),
            unit: String(u.unit),
            code: u.code,
            fraction: u.fraction,
            relation
        };

        file.attendees[idx].linked_units.push(link);
        this.write(file);

        const totalFraction =
            file.attendees[idx].fraction +
            file.attendees[idx].linked_units.reduce((acc, l) => acc + (l.fraction || 0), 0);

        return { attendee: file.attendees[idx], totalFraction };
    }

    /** Retorna o code (6 chars) de uma unidade específica, para exibir ao operador */
    getCodeByUnit(block: string, unit: string | number) {
        const u = this.units.findByBlockUnit(block, unit);
        if (!u) throw new Error('Unidade não encontrada');
        return { id: u.id, block: u.block, unit: u.unit, code: u.code, fraction: u.fraction };
    }
}

export const rollCallService = new RollCallService(unitsService);
