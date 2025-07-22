import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

const fromAtom = atomWithStorage('from', '选择出发地')
const toAtom = atomWithStorage('to', '选择目的地')
const dateAtom = atomWithStorage('date', new Date())

const pageAtom = atomWithStorage('page',0)

export { fromAtom ,toAtom ,dateAtom ,pageAtom }