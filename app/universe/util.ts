/**
 * @file utils for universe compute
 * @author keith
 */

/**
 * 
 * @param row 
 * @param column 
 * @param width 
 * @returns 
 */
export const getIndex = (row: number, column: number, width: number) => {
    return row * width + column;
};

export const bitIsSet = (n: number, arr: Uint8Array) => {
    const byte = Math.floor(n / 8);
    const mask = 1 << n % 8;
    return (arr[byte] & mask) === mask;
};


// test for getIndex
if (import.meta.vitest) {
    const { it, expect } = import.meta.vitest;

    it('getIndex test', () => {
        expect(getIndex(1, 1, 4)).toBe(5);
    });
}