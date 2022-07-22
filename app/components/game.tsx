import init from 'wasm-game-of-life';
import wasmPath from '../../pkg/wasm_game_of_life_bg.wasm?url';
import {useRef, useState, useEffect} from 'preact/hooks';
import {PlayIcon, PauseIcon} from '@heroicons/react/solid';
import {useFPS, FPS} from './fps';

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

const Game = () => {
    const canvas = useRef<HTMLCanvasElement>(null);

    const [animationStatus, setAnimationStatus] = useState(PlayStatus.play);
    const animationID = useRef<number | null>(null);
    const universeInfo = useRef<UniverseInfo | null>(null);

    const [fpsData, measure] = useFPS();

    const playHandler = () => {
        if (animationStatus === PlayStatus.play) {
            animationID.current && cancelAnimationFrame(animationID.current);
            setAnimationStatus(PlayStatus.pause);
        } else {
            setAnimationStatus(PlayStatus.play);
            animationID.current = requestAnimationFrame(renderLoop);
        }
    };

    const drawGrid = () => {
        const {ctx, width, height} = universeInfo.current!;
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
        const {ctx, width, height, module, pointer} = universeInfo.current!;
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
        measure();
        const {module, pointer} = universeInfo.current!;
        module.universe_tick(pointer);
        drawCells();
        animationID.current = requestAnimationFrame(renderLoop);
    };

    const start = () => {
        drawGrid();
        drawCells();
        animationID.current = requestAnimationFrame(renderLoop);
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
                universeInfo.current = {
                    ctx,
                    width,
                    height,
                    pointer: universe,
                    module,
                };
                start();
            });
        }

        return () => {
            animationID.current && cancelAnimationFrame(animationID.current);
            animationID.current = null;
            universeInfo.current = null;
        };
    }, []);

    return (
        <>
            <div className="flex justify-center flex-col items-center">
                <div className="flex">
                    <div className="flex justify-center flex-col items-center">
                        <canvas ref={canvas} className="rounded"></canvas>
                        <button
                            onClick={playHandler}
                            className="bg-indigo-600 rounded text-center w-40 h-10"
                        >
                            <div className="flex justify-center">
                                {animationStatus === PlayStatus.play ? (
                                    <PauseIcon className="w-10 h-10" />
                                ) : (
                                    <PlayIcon className="w-10 h-10" />
                                )}
                            </div>
                        </button>
                    </div>
                    <FPS fpsData={fpsData} />
                </div>
            </div>
        </>
    );
};

export {Game};
