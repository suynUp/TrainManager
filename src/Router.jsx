import { lazy, Suspense } from 'react';
import { Route, useLocation, Switch, Redirect } from "wouter";
import { atom, useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { userIdAtom, userAtom } from './atoms/userAtoms';
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
const PassengerManager = lazy(() => import("./pages/Main/Passenger"))
const RealNameAuth = lazy(() => import("./pages/Main/Authorize"))
const Manager = lazy(() => import("./ManagerApp"))
const OrderDetail = lazy(()=> import("./pages/Main/OrderInfo"))

const Router = () => {
    const [userId] = useAtom(userIdAtom)
    const [user, setUser] = useAtom(userAtom);
    const [location, setLocation] = useLocation();
    const [isCheckingUser, setIsCheckingUser] = useState(true);

    useEffect(() => {
        if (userId !== -1 && userId !== undefined && userId !== null) {
            getUser()
        } else {
            setIsCheckingUser(false);
        }
    }, [userId,location])

    const getUser = async () => {
        const response = await get("/user/get", { userId })
        if (response.code == 200) {
            setUser(response.data)
            setIsCheckingUser(false);
            
            // 不再强制跳转，而是通过条件渲染控制显示内容
            if (response.data.role === "MANAGER") {
                setLocation("/Manager");
            }
        }
    }

    // 如果正在检查用户身份，显示加载界面
    if (isCheckingUser) {
        return <LoadingFallback />;
    }

    // 如果是管理员且当前不在管理员页面，重定向到管理员页面
    if (user?.role === "MANAGER" && location !== "/Manager") {
        return (
            <Suspense fallback={<LoadingFallback />}>
                <Manager />
            </Suspense>
        );
    }
    
    // 添加判断：若非管理员在管理员页面则重定向主页面"/"
    if (location === "/Manager" && user?.role !== "MANAGER") {
        return <Redirect to="/" />;
    }
    
    const router = [
        { path: '/', compo: Main },
        { path: '/Login', compo: Login },
        { path: '/PaymentPage', compo: PaymentPage },
        { path: '/SeatSelection', compo: SeatSelection },
        { path: '/SearchStation', compo: SearchStation },
        { path: '/TrainList', compo: TrainList },
        { path: '/BookingSuccess', compo: BookingSuccess },
        { path: '/Passenger', compo: PassengerManager },
        { path: '/Auth', compo: RealNameAuth },
        { path: '/Manager', compo: Manager },
        { path: '/OrderDetail' , compo: OrderDetail}
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
    const [user] = useAtom(userAtom);
    const [, setLocation] = useLocation();
    
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
        
        // 添加判断：若非管理员在管理员页面则重定向主页面"/"
        if (path === "/Manager" && user?.role !== "MANAGER") {
            setLocation("/");
        }
    }, [path, cache, setCache, user, setLocation]);

    // 如果是管理员且尝试访问非管理员页面，返回null（会被重定向）
    if (user?.role === "MANAGER" && path !== "/Manager") {
        return null;
    }
    
    // 添加判断：若非管理员在管理员页面则返回null（会被重定向）
    if (path === "/Manager" && user?.role !== "MANAGER") {
        return null;
    }

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