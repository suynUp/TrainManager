import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";

const userAtom = atom({})
const userIdAtom = atomWithStorage('id',-1)
const userOrderAtom = atom([])
const userTeamAtom = atom([])

const trainAtom = atomWithStorage('trainType',null)
const seatTypeAtom = atomWithStorage('seatType',"firstClass")

const initialToken = localStorage.getItem('auth_token') || null;
// 创建可写 atom
const tokenAtom = atom(
  initialToken,
  (get, set, newToken) => {
    set(tokenAtom, newToken);
    localStorage.setItem('auth_token', newToken); // 保持同步
  }
);

export { tokenAtom, userAtom, userOrderAtom, userTeamAtom, trainAtom, seatTypeAtom, userIdAtom}