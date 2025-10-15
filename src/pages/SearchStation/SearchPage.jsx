import { useRef, useEffect, useState } from "react"
import { Search, TrainFront } from "lucide-react"
import { useLocation } from "wouter"
import { get } from "../../utils/request"
import { useAtom } from "jotai"
import { userIdAtom } from "../AtomExport"

const SearchPage = ({ setIsFocused, station, setStation, isFocused }) => {
    const inputRef = useRef(null)

    const [ about , setAbout ] = useState([])  

    const [userId] = useAtom(userIdAtom)

    const [,setLocation] = useLocation()
    /* 
    city: "北京"
    province: "北京市"
    stationCode: "BJN"
    stationId: 1
    stationName: "北京南站" */
    // 自动聚焦输入框
    useEffect(() => {
        if (isFocused && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isFocused])

    useEffect(()=>{
        getStation()
    },[station])

    const getStation = async () => {
        const res = await get("/station/search",{stationName:station.stationName,userId})
        if(res.code == 200){
            if(res.data==null){
                setAbout([])
            }else{
                setAbout(res.data)
            }
        }
    }

    const choose = (city) => {
        setStation(city)
        setIsFocused(false)
    }

    return (
        <>
            <div 
                className={`fixed inset-0 bg-opacity-20  bg-white/10 transition-all duration-300 ease-out ${
                    isFocused 
                        ? "opacity-90 backdrop-blur-md z-10" 
                        : "opacity-0 backdrop-blur-0 z-[-1] pointer-events-none"
                }`}
                onClick={() => setIsFocused(false)}
            ></div>

            <div 
                className={`min-w-[770px] fixed top-0 left-0 w-full flex justify-center transition-all duration-300 ease-out ${
                    isFocused 
                        ? "translate-y-[150px] opacity-100 z-20" 
                        : "translate-y-[50px] opacity-0 z-[-1] pointer-events-none"
                }`}
            >
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
                    <div className="flex flex-col">
                        <div className="rounded-[10px] items-center justify-center w-full flex h-[100px] bg-gradient-to-r from-sky-100 to-blue-400 shadow-lg">
                            <div>            
                                <Search className="inline"></Search>
                                <b>车站搜索</b>
                            </div>
                        </div>
                        <div className="flex">
                            <div className="shadow-lg border pl-[10px] w-[100%] rounded-[20px] mt-[20px] mb-[10px] flex items-center">
                                <Search></Search>
                                <input 
                                    className="border-none w-[90%] p-2 focus:outline-none"
                                    ref={inputRef}
                                    placeholder="输入城市或车站" 
                                    type="text" 
                                    value={station.stationName} 
                                    onChange={(e) => setStation({...station,stationName:e.target.value})}
                                    autoFocus
                                />
                            </div>
                            <div 
                                className="flex items-center justify-center mt-[20px] pl-[10px] w-[80px] h-[42px] pt-1 pb-1 pr-3 pl-1 border border-sky-200 bg-sky-500 border-2 rounded-[23px] m-[5px] text-[18px] text-white cursor-pointer shadow-xl hover:bg-white hover:text-sky-500 hover:shadow-lg transform hover:scale-105 active:scale-95"
                            >
                                搜索
                            </div>
                        </div>
                        <div className="max-h-[400px] overflow-auto">
                            { about.map((ele)=>{
                                return <div key={ele.stationId} 
                                className="flex border-cyan-200 border-l-4 border-r-4 shadow-lg rounded-[10px] 
                                           m-[2px] pt-[3px] pb-[3px] pl-[12px] text-cyan-700
                                           w-[760px] transition-all duration-400 cursor-pointer
                                           hover:scale-[1.01] hover:bg-cyan-400 hover:text-white"
                                onClick={()=>choose(ele)}
                                ><TrainFront className="h-[24px] w-[20px] mr-[5px]"></TrainFront>{ele.stationName}</div>
                            })}
                            { about.length === 0 && <div className="flex w-full h-[20vh] items-center justify-center text-gray-400">
                                    搜点什么吧
                                </div>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SearchPage