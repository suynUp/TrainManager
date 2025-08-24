import { useEffect, useRef, useState } from "react"
import CityBlock from "./CityBlock"
import { Search, Trash2, ArrowLeft, History, Flame } from "lucide-react"
import SearchPage from "./SearchPage"
import { useLocation } from "wouter"
import { fromAtom, toAtom, userIdAtom } from "../AtomExport"
import { useAtom } from "jotai"
import { get, post } from "../../utils/request"
import {ToastContainer, toast } from "react-toastify"

const SearchStation = () => {

    const [setLocation] = useLocation()

    const [station, setStation] = useState({stationId:-1,stationName:''})
    const [ ,setTo] = useAtom(toAtom)
    const [ ,setFrom] = useAtom(fromAtom)
    const [userId] = useAtom(userIdAtom)

    const [history, setHistory] = useState([])

    const [popular, setPopular] = useState([])
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef(null)

    const [key, setKey] = useState(null)

    useEffect(()=>{
        const searchParams = new URLSearchParams(window.location.search);
        setKey(searchParams.get("key")); 
    },[])

    useEffect(()=>{
        fetchData()
    },[station])

    const fetchData = async ()=>{
        if(station.stationName === '' ) return;
        if(isFocused === true ) return;
        key==='start'? setFrom(station):setTo(station)

        console.log("进来了")

        const res = await post('/stationHistory/add',{},{userId,stationId:station.stationId})
        if(res.code==200)window.history.back();
        else console.log(res.data)
    }

    useEffect(() => {
    const fetchHistory = async () => {
        try {
            const res = await get("/stationHistory/get", {userId});
            if(res.code === 200) {
                setHistory(res.data);
            }
        } catch (error) {
            console.error("获取历史记录失败:", error);
        }
    };
    
    fetchHistory();
    }, [userId]);

    const deleteHistory = async () =>{
        if(history.length === 0){
            toast('搜点什么再来吧~')
            return;
        }
        console.log('userId',userId)
        try {
            const res = await post("/stationHistory/delete",{}, {userId});
            if(res.code === 200){
                setHistory([])
                toast('删除成功')
            }
        } catch (error) {
            console.error("获取历史记录失败:", error);
        }
    }

    return (
        <div className="relative " >
            <SearchPage 
            station={station}
            isFocused={isFocused}
            setStation={setStation}
            setIsFocused={setIsFocused}/>
            <div className="z-5 flex flex-col bg-white rounded-lg shadow-lg p-6 mb-8 w-full max-w-4xl mx-auto">
                <ToastContainer/>
                <ArrowLeft
                onClick={()=>{ window.history.back(); }} 
                className="mb-[15px] cursor-pointer text-gray-500 hover:text-sky-400 h-[30px] w-[30px] hover:scale-[1.5] active:scale-95 transition-all duration-200 "/>
                <div className="rounded-[10px] items-center justify-center w-full flex h-[100px] bg-sky-100 transition:all duration-[1000]">
                    {!isFocused&&<div>            
                        <Search className="inline"></Search>
                        <b>车站搜索</b>
                    </div>}
                </div>

                {/* 搜索框（点击后会触发 isFocused=true，显示 SearchPage） */}
                <div className="shadow-lg border pl-[10px] w-[90%] rounded-[20px] mt-[20px] mb-[10px] flex items-center">
                    <Search className=""></Search>
                    <input 
                        className="border-none w-[90%] p-2 focus:outline-none"
                        ref={inputRef}
                        onFocus={() => setIsFocused(true)}
                        placeholder="输入城市或车站" 
                        type="text" 
                    />
                </div>

                {/* 历史记录（会被 SearchPage 的模糊背景覆盖） */}
                <div className="flex flex-col">
                    <div className="flex text-gray-500 ml-[10px] mt-[20px] mb-[10px]">
                        <div className="w-[40%] flex ">
                             <div className='mr-[5px] flex items-center justify-center rounded-[10px] w-[30px] h-[30px] bg-gradient-to-r from-yellow-300 to-yellow-400'>
                                <History className='text-white w-[18px] h-[18px]' />
                            </div>
                            历史记录</div>
                        <div className="items-center justify-end flex w-[50%]">
                            <label className="flex cursor-pointer" onClick={deleteHistory}>
                                清除历史
                                <Trash2 className="h-[22px]"/>
                            </label>
                        </div>
                    </div>
                    <div className="w-[90%] ml-[6px] flex flex-wrap">
                        {history.map(h => <CityBlock key={h.stationId} onClick={
                            ()=>{setStation(h)
                                console.log(h);
                            }} title={h.stationName} />)}
                    </div>
                    {history.length === 0&&<div className="text-gray-500 w-full text-center ml-[10px] h-[20px]">
                                快快搜索！
                            </div>}
                </div>

                {/* 热门城市（会被 SearchPage 的模糊背景覆盖） */}
                <div className="flex flex-col">
                    <div className="flex text-gray-500 ml-[10px] mt-[20px] mb-[10px]">
                        <div className="w-[40%] flex">
                             <div className='mr-[5px] flex items-center justify-center rounded-[10px] w-[30px] h-[30px] bg-gradient-to-r from-red-400 to-red-500'>
                                <Flame className='text-white w-[18px] h-[18px]' />
                            </div>
                            热门城市</div>
                    </div>
                    <div className="w-[90%] flex flex-wrap">
                        {popular.length === 0 ? (
                            <div className="text-gray-500 w-full text-center ml-[10px] h-[20px]">
                                好吧没什么热门城市,看来要由你们创造了！
                            </div>
                        ) : (
                            popular.map(p => <CityBlock key={p.stationId} onClick={()=>{
                                console.log(p)
                                setStation(p)}} title={p.stationName} />)
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SearchStation