import {Game} from './components/game';
import {WasmUniverse, JSUniverse} from './universe/universe';


export function App() {

    return (
        <>
            {/* <Game universe={new JSUniverse(128, 128)}/> */}
            <Game universe={new WasmUniverse(64, 64)}/>
            <Game universe={new WasmUniverse(64, 64)}/>
            <Game universe={new WasmUniverse(64, 64)}/>
        </>
    );
}
