import init from 'wasm-game-of-life';
import wasmPath from '../../pkg/wasm_game_of_life_bg.wasm?url';
import {useRef, useState, useEffect} from 'preact/hooks';
import {PlayIcon, PauseIcon} from '@heroicons/react/solid';

import type {InitOutput} from 'wasm-game-of-life';

const CELL_SIZE = 5; // px
const GRID_COLOR = '#CCCCCC';
const DEAD_COLOR = '#FFFFFF';
const ALIVE_COLOR = '#000000';

const bitIsSet = (n: number, arr: Uint8Array) => {
    const byte = Math.floor(n / 8);
    const mask = 1 << n % 8;
    return (arr[byte] & mask) === mask;
};

const getIndex = (row: number, column: number, width: number) => {
    return row * width + column;
};

enum PlayStatus {
    pause,
    play,
}

interface UniverseInfo {
    ctx: CanvasRenderingContext2D;
    pointer: number;
    width: number;
    height: number;
    module: InitOutput;
}

let animationID: number | null = null;
let universeInfo: UniverseInfo | null = null;

const Game = () => {
    const canvas = useRef<HTMLCanvasElement>(null);

    const [animationStatus, setAnimationStatus] = useState(PlayStatus.play);

    const playHandler = () => {
        if (animationStatus === PlayStatus.play) {
            animationID && cancelAnimationFrame(animationID);
            setAnimationStatus(PlayStatus.pause);
        } else {
            setAnimationStatus(PlayStatus.play);
            animationID = requestAnimationFrame(renderLoop);
        }
    };

    const drawGrid = () => {
        const {ctx, width, height} = universeInfo!;
        ctx.beginPath();
        ctx.strokeStyle = GRID_COLOR;

        // Vertical lines.
        for (let i = 0; i <= width; i++) {
            ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
            ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
        }

        // Horizontal lines.
        for (let j = 0; j <= height; j++) {
            ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
            ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
        }

        ctx.stroke();
    };

    const drawCells = () => {
        const {ctx, width, height, module, pointer} = universeInfo!;
        const cellsPtr = module.universe_cells(pointer);
        const cells = new Uint8Array(
            module.memory.buffer,
            cellsPtr,
            (width * height) / 8
        );

        ctx.beginPath();

        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const idx = getIndex(row, col, width);

                ctx.fillStyle = bitIsSet(idx, cells) ? ALIVE_COLOR : DEAD_COLOR;

                ctx.fillRect(
                    col * (CELL_SIZE + 1) + 1,
                    row * (CELL_SIZE + 1) + 1,
                    CELL_SIZE,
                    CELL_SIZE
                );
            }
        }

        ctx.stroke();
    };

    const renderLoop = () => {
        const {module, pointer} = universeInfo!;
        module.universe_tick(pointer);
        drawCells();
        animationID = requestAnimationFrame(renderLoop);
    };

    const start = () => {
        drawGrid();
        drawCells();
        animationID = requestAnimationFrame(renderLoop);
    };

    useEffect(() => {
        const canvasElement = canvas.current;
        if (canvasElement) {
            init(wasmPath).then((module) => {
                const universe = module.universe_new();
                const width = module.universe_width(universe);
                const height = module.universe_height(universe);

                canvasElement.width = (CELL_SIZE + 1) * width + 1;
                canvasElement.height = (CELL_SIZE + 1) * height + 1;

                const ctx = canvasElement.getContext('2d')!;
                universeInfo = {ctx, width, height, pointer: universe, module};
                start();
            });
        }

        return () => {
            animationID && cancelAnimationFrame(animationID);
            animationID = null;
            universeInfo = null;
        };
    }, []);

    return (
        <>
            <div className='flex justify-center flex-col items-center'>
                <canvas ref={canvas}></canvas>
                <button
                    onClick={playHandler}
                    className="w-10 h-10 bg-indigo-600"
                >
                    {animationStatus === PlayStatus.play ? (
                        <PauseIcon />
                    ) : (
                        <PlayIcon />
                    )}
                </button>
            </div>
        </>
    );
};

export {Game};
