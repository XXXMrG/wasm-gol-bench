/// <reference types="node" />

import {describe, it, expect, beforeEach} from 'vitest';
import {WasmUniverse} from '../../universe/universe';
import {readFile} from 'fs/promises';


describe('test for universe', () => {
    beforeEach(() => {
        const mockFetch = async (input: string) => {
            let filePath = input;

            // delete virtual file system path
            if (input.startsWith('/@fs')) {
                filePath = input.replace('/@fs', '');
            }

            const headers = new Headers();
            headers.set('Content-Type', 'application/wasm');

            const result = new Response(null, {
                headers
            });

            result.arrayBuffer = () => (readFile(filePath));

            return result;
        };

        // @ts-expect-error
        window.fetch = mockFetch;
    });


    it('test wasm universe', async () => {
    })
});