import { useEffect, useState } from 'react';
import { Search,RefreshCcw, Flag  } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation } from 'wouter';
import { useAtom } from 'jotai';
import { toAtom, fromAtom, dateAtom } from '../AtomExport';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const SearchForm = ({ onSearch, loading = false }) => {

  const [,setLocation] = useLocation()

  //检测逻辑
  const [warnFrom, setWarnFrom] = useState(false)
  const [warnTo, setWarnTo] = useState(false)

  const [from,setFrom] = useAtom(fromAtom)
  const [to,setTo] = useAtom(toAtom)
  const [date,setDate] = useAtom(dateAtom)

  useEffect(()=>{
    if(from===''||from === null){
      setFrom('选择出发地')
    }
    if(to===''||to ===null){
      setTo('选择目的地')
    }
  },[from,to])

  const handleSwapStations = () => {
  // 使用简单的值比较而不是valueOf()
  if ((from === '选择出发地' || from === '请先选择出发地') && to === '选择目的地') {
    return;
  }
  if (from === '选择出发地') {
    setFrom(to);
    setTo('选择目的地');
    return;
  }
  if (to === '选择目的地') {
    setTo(from);
    setFrom('选择出发地');
    return;
  }
  const mid = to;
  setTo(from);
  setFrom(mid);
};

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("?")
    CheckFrom()
    CheckTo()
    if(CheckFrom()||CheckTo()){
      return;
    }
    setLocation('/TrainList')
  };

  const CheckFrom = () => {
    if(from.valueOf()==='选择出发地'||from.valueOf()==='请先选择出发地'){
      setWarnFrom(true)
      setFrom('请先选择出发地')
      return true
    }
    return false
  }
  const CheckTo = () => {
    if(to.valueOf()==='选择目的地'||to.valueOf()==='请先选择目的地'){
      setWarnTo(true)
      setTo('请先选择目的地')
      return true
    }
    return false
  }

  const handleSearch = (str) => {//搜索
    const query = new URLSearchParams({
      key: str,
    }).toString();

    setLocation(`/SearchStation?${query}`); // 跳转到 /search?keyword=react&page=1
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">车票查询</h2>
        <p className="text-gray-600">选择出发地、目的地和日期，开始您的旅程</p>
      </div>

      <div className="flex flex-col space-y-4">
        {/* 出发地和目的地 */}
        <div className="flex flex-col gap-4 border-slate-200 rounded-lg bg-slate-100 m-2 p-4">
          <div className='flex'>
            <div className="flex flex-col flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                出发地
              </label>
              <div className="relative">
                <div
                  onClick={()=>{handleSearch('start')}}
                  className={`
                    ${warnFrom ? `text-red-600 border-red-700 border-2 box-border border-solid`:`bg-white `}
                    transition-all duration-200 hover:shadow-lg cursor-pointer w-full p-5 rounded-md appearance-none pr-8`}
                  >
                  {from}
                </div>

              </div>
            </div>
            <div onClick={handleSwapStations} className='mt-6 flex-1 content-center'>
            <div className="group flex flex-col items-center cursor-pointer">
              <RefreshCcw
                className="h-[40px] w-[30px] group-hover:w-[40px] group-active:scale-[0.9] m-auto group-hover:text-blue-600 transition-all duration-500"
              />
              <div className="text-xs opacity-0 text-blue-600 group-hover:opacity-100 transition-opacity transition:all duration-500">
                要换一换吗
              </div>
            </div> 
            </div>
            <div className="flex flex-col flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目的地
              </label>
              <div className="relative">
              <div
              onClick={()=>{handleSearch('end')}}
                className={`
                  ${warnTo ? `text-red-600 border-red-700 border-2 box-border border-solid`:`border-none `}
                  transition-all duration-200 hover:shadow-lg cursor-pointer bg-white w-full p-5 rounded-md appearance-none pr-8`}                >
                  {to}
                </div>
              </div>
            </div>
          </div>
                  {/* 日期选择 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              出发日期
            </label>
            <div
            className='cursor-pointer bg-white w-[300px] outline-none p-3 rounded mb-5 hover:shadow-lg transition-all duration-300'
            >{new Date(date).valueOf()}</div>
             <DayPicker
              mode="single"
              selected={date}
              onSelect={setDate}
              className="border border-gray-200 rounded-lg p-3"
              modifiersClassNames={{
                selected: 'bg-gradient-to-r from-blue-600 to-blue-700  text-white hover:bg-blue-700 rounded',
                today: 'font-bold text-blue-600 border-none rounded-[10px]',
                hover: 'hover:bg-blue-100 scale', // 悬停效果
              }}
              modifiersStyles={{
              hover: { 
                backgroundColor: '#EFF6FF', // 对应bg-blue-50
                transform: 'scale(1.05)',
                transition: 'all 0.2s ease'
              }
              }}
              styles={{
                day: { 
                  transition: 'background-color 0.2s, color 0.2s' // 平滑过渡
                }
              }}
            />

          </div>
        </div>
        </div>



        {/* 搜索按钮 */}
        <button
          disabled={loading}
          className="w-auto m-5 bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              搜索中...
            </div>
          ) : (
            <div onClick={handleSubmit} className="flex items-center justify-center">
              <Search className="h-5 w-5 mr-2" />
              搜索车票
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default SearchForm;