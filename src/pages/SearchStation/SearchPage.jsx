import { useRef, useEffect } from "react"
import { Search } from "lucide-react"

const SearchPage = ({ setIsFocused, station, setStation, isFocused }) => {
    const inputRef = useRef(null)

    // 自动聚焦输入框
    useEffect(() => {
        if (isFocused && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isFocused])

    return (
        <>
            {/* 模糊背景层（仅在 isFocused 时显示） */}
            <div 
                className={`fixed inset-0 bg-opacity-20  bg-white/10 transition-all duration-300 ease-out ${
                    isFocused 
                        ? "opacity-90 backdrop-blur-md z-10" 
                        : "opacity-0 backdrop-blur-0 z-[-1] pointer-events-none"
                }`}
                onClick={() => setIsFocused(false)}
            ></div>

            {/* 搜索框容器（带滑入动画） */}
            <div 
                className={`min-w-[770px] fixed top-0 left-0 w-full flex justify-center transition-all duration-300 ease-out ${
                    isFocused 
                        ? "translate-y-[150px] opacity-100 z-20" 
                        : "translate-y-[50px] opacity-0 z-[-1] pointer-events-none"
                }`}
            >
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
                    <div className="flex flex-col">
                        <div className="rounded-[10px] items-center justify-center w-full flex h-[100px] bg-sky-100">
                            <div>            
                                <Search className="inline"></Search>
                                <b>车站搜索</b>
                            </div>
                        </div>
                        <div className="flex">
                            <div className="shadow-lg border pl-[10px] w-[100%] rounded-[20px] mt-[20px] mb-[10px] flex items-center">
                                <Search className=""></Search>
                                <input 
                                    className="border-none w-[90%] p-2 focus:outline-none"
                                    ref={inputRef}
                                    placeholder="输入城市或车站" 
                                    type="text" 
                                    value={station} 
                                    onChange={(e) => setStation(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div 
                                className="flex items-center justify-center mt-[20px] pl-[10px] w-[80px] h-[42px] pt-1 pb-1 pr-3 pl-1 border border-sky-200 bg-sky-500 border-2 rounded-[23px] m-[5px] text-[18px] text-white cursor-pointer shadow-xl hover:bg-white hover:text-sky-500 hover:shadow-lg transform hover:scale-105 active:scale-95"
                            >
                                搜索
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SearchPage