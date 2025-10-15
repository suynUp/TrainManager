import { atomWithStorage } from 'jotai/utils';

const fromAtom = atomWithStorage('from', {stationId:-1,stationName:'选择出发地'})
const toAtom = atomWithStorage('to',{stationId:-1,stationName:'选择目的地'}) 
// dateAtoms.js
const dateAtom = atomWithStorage('date', new Date(), {
  getItem: (key, initialValue) => {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) return initialValue;
    try {
      const date = new Date(storedValue);
      // 确保日期有效
      return isNaN(date.getTime()) ? initialValue : date;
    } catch {
      return initialValue;
    }
  },
  setItem: (key, value) => {
    localStorage.setItem(key, value.toISOString());
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
  },
});
const train = atomWithStorage('trainList',[])

const pageAtom = atomWithStorage('page',0)

export { fromAtom ,toAtom ,dateAtom ,pageAtom }