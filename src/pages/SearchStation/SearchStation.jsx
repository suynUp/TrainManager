import { useEffect, useRef, useState } from "react"
import CityBlock from "./CityBlock"
import { Search, Trash2, ArrowLeft } from "lucide-react"
import SearchPage from "./SearchPage"
import { useLocation } from "wouter"
import { fromAtom, toAtom } from "../AtomExport"
import { useAtom } from "jotai"

const SearchStation = () => {

    const [setLocation] = useLocation()

    const [station, setStation] = useState('')
    const [ ,setTo] = useAtom(toAtom)
    const [ ,setFrom] = useAtom(fromAtom)

    const [history, setHistory] = useState([
        '北京', '成都', '广州', '杭州', '南京', 
        '上海', '深圳', '苏州', '武汉', '西安'
    ])

    const [popular, setPopular] = useState([])
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef(null)

    const [key, setKey] = useState(null)

    useEffect(()=>{
        const searchParams = new URLSearchParams(window.location.search);
        setKey(searchParams.get("key")); // "start"
    },[])

    useEffect(()=>{
        if(station==='') return;
        key==='start'? setFrom(station):setTo(station)
        window.history.back();
    },[station])

    return (
        <div className="relative " >
            {/* 当 input 获取焦点时，显示 SearchPage（模糊背景 + 搜索框） */}
            <SearchPage 
            station={station}
            isFocused={isFocused}
            setStation={setStation}
            setIsFocused={setIsFocused}/>
            {/* 主内容（如果 isFocused=true，则会被 SearchPage 的模糊背景覆盖） */}
            <div className="z-5 flex flex-col bg-white rounded-lg shadow-lg p-6 mb-8 w-full max-w-4xl mx-auto">
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
                        <div className="w-[40%]">历史记录</div>
                        <div className="items-center justify-end flex w-[50%]">
                            <label className="flex cursor-pointer">
                                清除历史
                                <Trash2 className="h-[22px]"/>
                            </label>
                        </div>
                    </div>
                    <div className="w-[90%] flex flex-wrap">
                        {history.map(h => <CityBlock key={h} onClick={()=>{setStation(h)}} title={h} />)}
                    </div>
                </div>

                {/* 热门城市（会被 SearchPage 的模糊背景覆盖） */}
                <div className="flex flex-col">
                    <div className="flex text-gray-500 ml-[10px] mt-[20px] mb-[10px]">
                        <div className="w-[40%]">热门城市</div>
                    </div>
                    <div className="w-[90%] flex flex-wrap">
                        {popular.length === 0 ? (
                            <div className="text-gray-500 w-full text-center ml-[10px] h-[20px]">
                                好吧没什么热门城市,看来要由你们创造了！
                            </div>
                        ) : (
                            popular.map(p => <CityBlock key={p} onClick={()=>{setStation(p)}} title={p} />)
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SearchStation