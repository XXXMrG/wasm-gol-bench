import {render} from 'preact';
import {App} from './app';
import './index.css';

console.log('test');

render(<App />, document.getElementById('app')!);
