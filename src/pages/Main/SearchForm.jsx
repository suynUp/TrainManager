import { useEffect, useState } from 'react';
import { Search, RefreshCcw, MapPin } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation } from 'wouter';
import { useAtom } from 'jotai';
import { toAtom, fromAtom, dateAtom } from '../AtomExport';
import MyDatePicker from '../../components/DatePicker';

const SearchForm = ({ onSearch, loading = false }) => {
  const [, setLocation] = useLocation();

  // 检测逻辑
  const [warnFrom, setWarnFrom] = useState(false);
  const [warnTo, setWarnTo] = useState(false);
  const [warnDate, setWarnData] = useState(false);

  const [from, setFrom] = useAtom(fromAtom);
  const [to, setTo] = useAtom(toAtom);
  const [selectedDate, setSelectedDate] = useAtom(dateAtom);

  // 初始化检查
  useEffect(() => {
    if (!from.stationName || from.stationName === '') {
      setFrom({ stationId: -1, stationName: '选择出发地' });
    }
    if (!to.stationName || to.stationName === '') {
      setTo({ stationId: -1, stationName: '选择目的地' });
    }
  }, [from.stationName, to.stationName, setFrom, setTo]);

  // 交换出发地和目的地
  const handleSwapStations = () => {
    // 如果出发地和目的地都是默认值，则不交换
    if (
      (from.stationName === '选择出发地' || from.stationName === '请先选择出发地') &&
      to.stationName === '选择目的地'
    ) {
      return;
    }
    
    // 如果出发地是默认值，将目的地设为出发地，目的地重置
    if (from.stationName === '选择出发地' || from.stationName === '请先选择出发地') {
      setFrom(to);
      setTo({ stationId: -1, stationName: '选择目的地' });
      return;
    }
    
    // 如果目的地是默认值，将出发地设为目的值，出发地重置
    if (to.stationName === '选择目的地') {
      setTo(from);
      setFrom({ stationId: -1, stationName: '选择出发地' });
      return;
    }
    
    // 正常交换
    const temp = to;
    setTo(from);
    setFrom(temp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (CheckFrom() || CheckTo() || CheckDate()) {
      return;
    }
    if (from.stationId === to.stationId && from.stationId !== -1) {
      alert('请选择不同出发地与目的地');
      return;
    }
    setLocation('/TrainList');
  };

  // 检查出发地
  const CheckFrom = () => {
    if (
      from.stationName === '选择出发地' ||
      from.stationName === '请先选择出发地' ||
      from.stationId === -1
    ) {
      setWarnFrom(true);
      setFrom({ stationId: -1, stationName: '请先选择出发地' });
      return true;
    }
    setWarnFrom(false);
    return false;
  };

  // 检查目的地
  const CheckTo = () => {
    if (
      to.stationName === '选择目的地' ||
      to.stationName === '请先选择目的地' ||
      to.stationId === -1
    ) {
      setWarnTo(true);
      setTo({ stationId: -1, stationName: '请先选择目的地' });
      return true;
    }
    setWarnTo(false);
    return false;
  };

  const CheckDate = () => {
    if (selectedDate == null) {
      setWarnData(true);
      return true;
    } else {
      setWarnData(false);
      return false;
    }
  };

  const handleSearch = (str) => {
    const query = new URLSearchParams({
      key: str,
    }).toString();
    setLocation(`/SearchStation?${query}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 w-full max-w-4xl mx-auto">
      <div className="mb-6 rounded-t-[20px] pl-[20px] pt-[10px] pb-[5px] bg-gradient-to-r from-blue-400 to-blue-600 w-[98%] m-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">车票查询</h2>
        <p className="text-white">选择出发地、目的地和日期，开始您的旅程</p>
      </div>

      <div className="flex flex-col space-y-4">
        {/* 出发地和目的地 */}
        <div className="flex flex-col gap-4 border-slate-200 rounded-lg bg-sky-50 m-2 p-4">
          <div className='flex'>
            <div className="flex flex-col flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                出发地
              </label>
              <div className="relative">
                <div
                  onClick={() => handleSearch('start')}
                  className={`text-[20px] border-gray-200 border-2
                    ${warnFrom ? `text-red-600 border-red-700 border-2 box-border border-solid` : `bg-white`}
                    flex transition-all duration-200 hover:border-blue-400 hover:shadow-lg cursor-pointer w-full p-5 rounded-md appearance-none pr-8`}
                >
                  <div className='mr-[20px] flex items-center justify-center rounded-[10px] w-[30px] h-[30px] bg-gradient-to-r from-blue-600 to-blue-700'>
                    <MapPin className='text-white h-[18px] w-[18px]'/>
                  </div>
                  {from.stationName}
                </div>
              </div>
            </div>
            
            <div onClick={handleSwapStations} className='mt-6 flex-1 content-center'>
              <div className="group flex flex-col items-center cursor-pointer">
                <RefreshCcw
                  className="h-[40px] w-[30px] group-hover:w-[40px] group-active:scale-[0.9] m-auto group-hover:text-blue-600 group-hover:rotate-180 transition-all duration-500"
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
                  onClick={() => handleSearch('end')}
                  className={`text-[20px] border-gray-200 border-2
                    ${warnTo ? `text-red-600 border-red-700 border-2 box-border border-solid` : `bg-white`}
                    flex transition-all duration-200 hover:border-blue-400 hover:shadow-lg cursor-pointer w-full p-5 rounded-md appearance-none pr-8`}
                >
                  <div className='mr-[20px] flex items-center justify-center rounded-[10px] w-[30px] h-[30px] bg-gradient-to-r from-blue-600 to-blue-700'>
                    <MapPin className='text-white h-[18px] w-[18px]'/>
                  </div>
                  {to.stationName}
                </div>
              </div>
            </div>
          </div>
          
          {/* 日期选择 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="space-y-6">
                {/* 日期选择器 */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 hover:shadow-lg transition-all duration-500 border border-white/50">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    出发日期
                  </label>
                  <MyDatePicker
                    setWarn={setWarnData}
                    warn={warnDate}
                    value={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date);
                      setWarnData(false);
                    }}
                    placeholder={warnDate ? '请选择日期' : '选择出发日期'}
                    className="mb-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索按钮 */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-auto m-5 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg hover:scale-[1.02] active:scale-[.98] text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              搜索中...
            </div>
          ) : (
            <div className="flex items-center justify-center">
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