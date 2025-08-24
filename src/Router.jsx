import { lazy, Suspense, } from 'react';
import { Route,useLocation } from "wouter";
import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { userIdAtom, userAtom, tokenAtom } from './atoms/userAtoms';
import { get } from './utils/request';

// 创建缓存原子
const pageCacheAtom = atom(new Map());

// 懒加载组件
const Main = lazy(() => import("./pages/Main/Main"));
const Login = lazy(() => import("./pages/Login/Login"));
const PaymentPage = lazy(() => import("./pages/Buy/PaymentPage"));
const SeatSelection = lazy(() => import("./pages/Buy/SeatSelection"));
const SearchStation = lazy(() => import("./pages/SearchStation/SearchStation"));
const TrainList = lazy(() => import("./pages/Buy/TrainList"));
const BookingSuccess = lazy(() => import("./pages/Buy/BookingSuccess"))
const PassengerManager = lazy(()=>import("./pages/Main/Passenger"))
const RealNameAuth = lazy(()=>import("./pages/Main/Authorize"))
const Manager = lazy(()=>import("./ManagerApp"))

const Router = () => {

    const [userId] = useAtom(userIdAtom)
    const [, setUser] = useAtom(userAtom);

    const [, setLocation] = useLocation();

    useEffect(()=>{
        console.log("userId",userId)
        if(userId !== -1&&userId !== undefined&&userId !== null){
        console.log(userId)
        getUser()
        }
    },[userId])

    const getUser = async () => {
        const response = await get("/user/get",{userId})
        if(response.code == 200){
        console.log(response.data)
        setUser(response.data)
        console.log(response.data.role)
        if(response.data.role === "MANAGER"){
           setLocation("/Manager");
        }else{
            setLocation("/")
        }
        } 
    }

    const router = [
        { path: '/', compo: Main },
        { path: '/Login', compo: Login },
        { path: '/PaymentPage', compo: PaymentPage },
        { path: '/SeatSelection', compo: SeatSelection },
        { path: '/SearchStation', compo: SearchStation },
        { path: '/TrainList', compo: TrainList },
        { path: '/BookingSuccess', compo: BookingSuccess},
        { path: '/Passenger' , compo: PassengerManager},
        { path: '/Auth' , compo: RealNameAuth},
        { path: '/Manager', compo: Manager}
    ]

    return (
        <div>
            {router.map((r) => (
                <Route key={r.path} path={r.path}>
                    <CacheWrapper component={r.compo} path={r.path} />
                </Route>
            ))}
        </div>
    )
}

const CacheWrapper = ({ component: Component, path }) => {
    const [cache, setCache] = useAtom(pageCacheAtom);
    
    useEffect(() => {
        if (!cache.has(path)) {
            setCache(prev => {
                const newCache = new Map(prev);
                newCache.set(path, 
                    <Suspense fallback={<LoadingFallback />}>
                        <Component />
                    </Suspense>
                );
                return newCache;
            });
        }
    }, [path, cache, setCache]);

    return cache.get(path) || (
        <Suspense fallback={<LoadingFallback />}>
            <Component />
        </Suspense>
    );
}

// 加载中的占位组件
const LoadingFallback = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
}

export default Router;