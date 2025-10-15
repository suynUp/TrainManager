import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const priceAtom = atom({})
const passengersAtom = atomWithStorage('passenger',[])
const seatsAtom = atom([{carNumber:1,seatNumber:2},{carNumber:1,seatNumber:2}])
const orderAtom = atomWithStorage('order',{})

export {priceAtom ,passengersAtom,seatsAtom,orderAtom}