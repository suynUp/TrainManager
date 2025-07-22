import Header from "./Header"
import OrdersPage from "./Orders/OrdersPage"
import SearchForm from "./SearchForm"
import UserInfo from "./UserInfo"
import { useAtom } from "jotai"
import { pageAtom } from "../AtomExport"

export default ()=>{

    const [currentPage , setCurrentPage] = useAtom(pageAtom)

    const compo =[<SearchForm/>,<OrdersPage/>,<UserInfo/>]

    return <>
    <Header
    cPage={currentPage}
    setCPage={setCurrentPage}
    ></Header>
    {compo[currentPage]}
    </>
}