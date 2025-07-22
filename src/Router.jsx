import { Route, Link } from "wouter";

import Login from "./pages/Login/Login";
import Main from "./pages/Main/Main"
import PassengerInfo from "./pages/Buy/PassengerInfo";
import PaymentPage from "./pages/Buy/PaymentPage";
import SeatSelection from "./pages/Buy/SeatSelection";
import SearchStation from "./pages/SearchStation/SearchStation";
import TrainList from "./pages/Buy/TrainList";

export default ()=>{
    
    const router = [
        {path:'/',compo:Main},
        {path:'/Login',compo:Login},
        {path:'/PassengerInfo',compo:PassengerInfo},
        {path:'/PaymentPage',compo:PaymentPage},
        {path:'/SeatSelection',compo:SeatSelection},
        {path:'/SearchStation',compo:SearchStation},
        {path:'/TrainList',compo:TrainList}
    ]

    return <div>
        {router.map((r) => <Route key={r.path} path={r.path}>
            <r.compo/>
        </Route>)}
    </div>
}