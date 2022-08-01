import {Game} from './components/game';
import {WasmUniverse} from './universe/universe';

export function App() {

    return (
        <>
            <Game universe={new WasmUniverse()}/>
            {/* <Game /> */}
        </>
    );
}
