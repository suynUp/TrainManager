import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

const fromAtom = atomWithStorage('from', {stationId:-1,stationName:'选择出发地'})
const toAtom = atomWithStorage('to',{stationId:-1,stationName:'选择目的地'}) 
const dateAtom = atomWithStorage('date', new Date())

const pageAtom = atomWithStorage('page',0)

export { fromAtom ,toAtom ,dateAtom ,pageAtom }