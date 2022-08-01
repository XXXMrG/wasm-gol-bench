/**
 * @file multi-type universe implementation
 * @author keith
 */

import init from 'wasm-game-of-life';
import wasmPath from '../../pkg/wasm_game_of_life_bg.wasm?url';

import type {InitOutput} from 'wasm-game-of-life';

export interface Universe {
    width?: number;
    height?: number;

    getCells: () => number | undefined;
    tick: () => void;
    init: () => Promise<void>;
    getBuffer: () => ArrayBuffer | undefined;
}

export class WasmUniverse implements Universe {
    width?: number;
    height?: number;

    private module?: InitOutput;
    private pointer?: number;

    async init() {
        this.module = await init(wasmPath);
        this.pointer = this.module.universe_new();
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

}
