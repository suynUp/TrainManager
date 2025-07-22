import { atomWithStorage } from "jotai/utils";
import { dateAtom } from "./mainPageAtoms";
import { useAtom } from "jotai";

const [ date ,] = useAtom(dateAtom)

const timeFilterAtom = atomWithStorage('timeFilter','')
const typeFilterAtom = atomWithStorage('typeFilter','')
const dateFilterAtom = atomWithStorage('dateFilter',new Date(date))

export { timeFilterAtom ,typeFilterAtom ,dateFilterAtom }
