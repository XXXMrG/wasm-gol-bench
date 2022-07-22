/**
 * @file component and hooks to show page's fps
 * @author keith
 */

import {useRef, useState} from 'preact/hooks';

interface FPSData {
    fps: number;
    mean: number;
    min: number;
    max: number;
}

export const useFPS = (): [FPSData | undefined, () => void] => {
    const [fpsData, setFPSData] = useState<FPSData>();
    const frames = useRef<number[]>([]);
    const lastFrameTimeStamp = useRef(performance.now());

    const measure = () => {
        const now = performance.now();
        const delta = now - lastFrameTimeStamp.current;
        lastFrameTimeStamp.current = now;

        const fps = (1 / delta) * 1000;
        frames.current.push(fps);
        if (frames.current.length > 100) {
            frames.current.shift();
        }

        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        for (let i = 0; i < frames.current.length; i++) {
            sum += frames.current[i];
            min = Math.min(frames.current[i], min);
            max = Math.max(frames.current[i], max);
        }
        let mean = sum / frames.current.length;

        setFPSData({
            fps,
            mean,
            max,
            min,
        });
    };

    return [fpsData, measure];
};

export const FPS = (props: {fpsData: FPSData | undefined}) => {
    return (
        <>
            {props.fpsData && (
                <div className='bg-black/70 text-xs p-1 rounded-sm h-20'>
                    <ul>
                        {Object.keys(props.fpsData).map((metrics) => (
                            <li key={metrics}>
                                {metrics}:{' '}
                                {Math.round(props.fpsData![metrics as keyof FPSData])}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
};
