import Header from "./Header"
import OrdersPage from "./Orders/OrdersPage"
import SearchForm from "./SearchForm"
import UserInfo from "./UserInfo"
import { useAtom } from "jotai"
import { pageAtom } from "../AtomExport"

import backgroundImage from '../../assets/bg.png';

const Main = ()=>{

    const [currentPage , setCurrentPage] = useAtom(pageAtom)

    const compo =[<SearchForm/>,<OrdersPage/>,<UserInfo/>]

    return <>
    <Header
    cPage={currentPage}
    setCPage={setCurrentPage}
    ></Header>
    <div className="relative z-10">
        <div className="min-h-screen relative" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      paddingTop: '4rem' // 添加顶部内边距，为导航栏留出空间
    }}>
    {compo[currentPage]}
    </div>
    </div>
    </>

}

export default Main;