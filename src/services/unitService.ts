import fs from 'fs';
import path from 'path';

export type UnitRecord = {
    id: number;
    unit: number | string;
    block: string;
    fraction: number;    // percentual (ex.: 0.300133)
    code: string;        // código de 6 chars
};

const UNITS_FILE = path.resolve(process.cwd(), 'data', 'units_with_codes.json');

export class UnitsService {
    private units: UnitRecord[] = [];

    constructor() {
        if (!fs.existsSync(UNITS_FILE)) {
            throw new Error(`Arquivo não encontrado: ${UNITS_FILE}`);
        }
        const raw = fs.readFileSync(UNITS_FILE, 'utf-8');
        this.units = JSON.parse(raw) as UnitRecord[];
    }

    list(): UnitRecord[] {
        return this.units;
    }

    normalize(block: string, unit: string | number) {
        const b = String(block).trim().toUpperCase().replace('BLOCO', '').trim();
        const u = String(unit).trim().replace(/^0+/, ''); // remove zeros à esquerda
        return { block: b, unit: u };
    }

    findByBlockUnit(block: string, unit: string | number): UnitRecord | undefined {
        const { block: b, unit: u } = this.normalize(block, unit);
        return this.units.find(
            (x) => x.block.toUpperCase() === b && String(x.unit) === u
        );
    }

    findById(id: number): UnitRecord | undefined {
        return this.units.find((x) => x.id === id);
    }
}

export const unitsService = new UnitsService();
