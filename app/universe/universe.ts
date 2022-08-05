/**
 * @file multi-type universe implementation
 * @author keith
 */

import init from 'wasm-game-of-life';
import wasmPath from '../../pkg/wasm_game_of_life_bg.wasm?url';
import {getIndex, bitIsSet} from './util';

import type {InitOutput} from 'wasm-game-of-life';

export interface Universe {
    width?: number;
    height?: number;

    getCells: () => number | undefined;
    tick: () => void;
    init: () => Promise<void>;
    getBuffer: () => ArrayBuffer | undefined;
    isAlive: (row: number, col: number) => boolean;
}

let wasmModuleCache: Promise<InitOutput> | null = null;

export class WasmUniverse implements Universe {
    width: number;
    height: number;

    private module?: InitOutput;
    private pointer?: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    async init() {
        if (!wasmModuleCache) {
            wasmModuleCache = init(wasmPath);
        }

        this.module = await wasmModuleCache;
        this.pointer = this.module.universe_new(this.width, this.height);
        this.width = this.module.universe_width(this.pointer!);
        this.height = this.module.universe_height(this.pointer!);
    }

    getCells() {
        return this.module?.universe_cells(this.pointer!);
    }

    tick() {
        this.module?.universe_tick(this.pointer!);
    }

    getBuffer() {
        return this.module?.memory.buffer;
    };

    isAlive(row: number, col: number): boolean {
        const index = getIndex(row, col, this.width);
        const buffer = this.module?.memory.buffer;
        const byteOffset = this.module?.universe_cells(this.pointer!);

        const arrayBuffer = new Uint8Array(buffer!, byteOffset,( this.width * this.height) / 8);
        return bitIsSet(index, arrayBuffer);
    }
}

export class JSUniverse implements Universe {
    width: number;
    height: number;

    private cells?: Uint8Array;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    async init() {
        const size = this.width * this.height;
        const buffer = new ArrayBuffer(size);
        this.cells = new Uint8Array(buffer).map(() => {
            return +(Math.random() < 0.5);
        });
    }

    getCells() {
        return this.cells?.byteOffset;
    };

    getBuffer() {
        return this.cells?.buffer;
    };

    tick() {
        const next = new Uint8Array(this.cells!);
        for (let row = 0; row < this.height; row++) {
            for (let col = 0 ; col < this.width; col++) {
                const cellIndex = getIndex(row, col, this.width);
                const cell = this.cells![cellIndex];

                const liveNeighborCount = this.liveNeighborCount(row, col);
                let isNextAlive = 0;
                if (cell) {
                    if (liveNeighborCount === 2 || liveNeighborCount === 3) {
                        isNextAlive = 1;
                    }
                }
                else if (liveNeighborCount === 3) {
                    isNextAlive = 1;
                }
                next[cellIndex] = isNextAlive;
            }
        }

        // update whole cell
        this.cells = next;
    };

    isAlive(row: number, col: number): boolean {
        return !!this.cells![getIndex(row, col, this.width!)];
    };

    /**
     * get a cell's neighbor alive cells count
     */
    private liveNeighborCount(row: number, column: number): number {
        let count = 0;
        const rowSet = [this.height - 1, 0, 1];
        const columnSet = [this.width - 1, 0, 1];

        for (const deltaRow of rowSet) {
            for (const deltaColumn of columnSet) {
                if (deltaRow === 0 && deltaColumn === 0) {
                    continue;
                }

                const neighborRow = (row + deltaRow) % this.height;
                const neighborColumn = (column + deltaColumn) % this.width;
                const index = getIndex(neighborRow, neighborColumn, this.width);

                count += this.cells![index];
            }
        }

        return count;
    }
}
