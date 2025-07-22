import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";

const tokenAtom = atomWithStorage('token',null)
const userAtom = atom({})
const userOrderAtom = atom([])
const userTeamAtom = atom([])

export { tokenAtom ,userAtom ,userOrderAtom ,userTeamAtom }