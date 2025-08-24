import { atom } from "jotai";

const priceAtom = atom(0)
const passengersAtom = atom([])
const seatsAtom = atom([{carNumber:1,seatNumber:2},{carNumber:1,seatNumber:2}])

export {priceAtom ,passengersAtom,seatsAtom}