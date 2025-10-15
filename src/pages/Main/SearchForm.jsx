import { useEffect, useState } from 'react';
import { Search, RefreshCw, MapPin, Calendar, Train, ArrowRightLeft, Clock, User, ArrowRight } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation } from 'wouter';
import { useAtom } from 'jotai';
import { toAtom, fromAtom, dateAtom ,userIdAtom } from '../AtomExport';
import MyDatePicker from '../../components/DatePicker';
import { get } from '../../utils/request';
import { fixSpringBootTime } from '../../utils/fixTime';

const SearchForm = ({ loading = false }) => {
  const [, setLocation] = useLocation();
  const [warnFrom, setWarnFrom] = useState(false);
  const [warnTo, setWarnTo] = useState(false);
  const [warnDate, setWarnData] = useState(false);
  const [from, setFrom] = useAtom(fromAtom);
  const [to, setTo] = useAtom(toAtom);
  const [selectedDate, setSelectedDate] = useAtom(dateAtom);
  const [isSwapping, setIsSwapping] = useState(false);
  const [todayOrders, setTodayOrders] = useState([]);
  const [userId] = useAtom(userIdAtom);

  const after15Days = new Date();

  // 初始化检查
  useEffect(() => {
    if (!from.stationName || from.stationName === '') {
      setFrom({ stationId: -1, stationName: '选择出发地' });
    }
    if (!to.stationName || to.stationName === '') {
      setTo({ stationId: -1, stationName: '选择目的地' });
    }
  }, [from.stationName, to.stationName, setFrom, setTo]);

  useEffect(() => {
    const fetchTodayOrder = async () => {
      try {
        const res = await get("/orderMessage/get", { userId, orderId: -1 });
        const ordersWithFixedTime = res.data.map(d => {
          return {
            ...d,
            arrivalTime: fixSpringBootTime(d.orders.arrivalTime),
            startTime: fixSpringBootTime(d.orders.startTime)
          }
        });
        
        // 筛选今日订单并按出发时间排序
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayOrders = ordersWithFixedTime
          .filter(order => {
            const orderDate = new Date(order.startTime);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
          })
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        
        // setTodayOrders(todayOrders);
      } catch (error) {
        console.error("获取今日订单失败:", error);
      }
    };
    
    fetchTodayOrder();
    
    const today = new Date();
    after15Days.setDate(today.getDate() + 15);

    if (!isNaN(selectedDate.getTime())) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const compareDate = new Date(selectedDate);
      compareDate.setHours(0, 0, 0, 0);
      
      if (compareDate < today) {
        setSelectedDate(today);
      }
    }
  }, [userId, selectedDate, setSelectedDate]);



  // 交换出发地和目的地
  const handleSwapStations = async () => {
    if (
      (from.stationName === '选择出发地' || from.stationName === '请先选择出发地') &&
      to.stationName === '选择目的地'
    ) {
      return;
    }
    
    setIsSwapping(true);
    
    // 添加动画效果
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (from.stationName === '选择出发地' || from.stationName === '请先选择出发地') {
      setFrom(to);
      setTo({ stationId: -1, stationName: '选择目的地' });
    } else if (to.stationName === '选择目的地') {
      setTo(from);
      setFrom({ stationId: -1, stationName: '选择出发地' });
    } else {
      const temp = to;
      setTo(from);
      setFrom(temp);
    }
    
    setIsSwapping(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // 阻止默认表单提交行为
    
    const hasError = CheckFrom() || CheckTo() || CheckDate();
    if (hasError) return;
    
    if (from.stationId === to.stationId && from.stationId !== -1) {
      alert('出发地和目的地不能相同');
      return;
    }

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');

    const query = new URLSearchParams({
      fromId: from.stationId,
      toId: to.stationId,
      date: `${year}-${month}-${day}`
    }).toString();
    
    setLocation(`/TrainList?${query}`);
  };

  const CheckFrom = () => {
    const isValid = !from.stationName || from.stationName === '选择出发地' || from.stationName === '请先选择出发地' || from.stationId === -1;
    setWarnFrom(isValid);
    if (isValid) {
      setFrom({ stationId: -1, stationName: '请先选择出发地' });
    }
    return isValid;
  };

  const CheckTo = () => {
    const isValid = !to.stationName || to.stationName === '选择目的地' || to.stationName === '请先选择目的地' || to.stationId === -1;
    setWarnTo(isValid);
    if (isValid) {
      setTo({ stationId: -1, stationName: '请先选择目的地' });
    }
    return isValid;
  };

  const CheckDate = () => {
    const isValid = selectedDate == null;
    setWarnData(isValid);
    return isValid;
  };

  const handleSearch = (type) => {
    const query = new URLSearchParams({
      key: type,
    }).toString();
    setLocation(`/SearchStation?${query}`);
  };

  const formatStationDisplay = (station) => {
    if (station.stationName === '选择出发地' || station.stationName === '请先选择出发地' || 
        station.stationName === '选择目的地' || station.stationName === '请先选择目的地') {
      return station.stationName;
    }
    return station.stationName;
  };
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 获取状态对应的颜色和文本
  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDING':
        return { color: 'text-amber-600 bg-amber-100', text: '待处理' };
      case 'PAID':
        return { color: 'text-blue-600 bg-blue-100', text: '已支付' };
      case 'COMPLETED':
        return { color: 'text-green-600 bg-green-100', text: '已完成' };
      case 'CANCELLED':
        return { color: 'text-red-600 bg-red-100', text: '已取消' };
      default:
        return { color: 'text-gray-600 bg-gray-100', text: status };
    }
  };
  const getSeatClassText = (seatClass) => {
    switch (seatClass) {
      case 'BUSINESS':
        return '商务座';
      case 'FIRST':
        return '一等座';
      case 'SECOND':
        return '二等座';
      default:
        return seatClass;
    }
  };
  return (
    <div className="flex-col relative min-h-screen flex items-center justify-center p-4">
      
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-4">
              <Train className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">车票查询</h2>
            <p className="text-gray-600">选择出发地、目的地和日期，开始您的旅程</p>
          </div>

          {/* 移除form标签或者修改按钮类型 */}
          <div className="space-y-6">
            {/* 车站选择区域 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* 出发地 */}
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    出发地
                  </label>
                  <div
                    onClick={() => handleSearch('start')}
                    className={`relative cursor-pointer transition-all duration-300 ${
                      warnFrom 
                        ? 'border-2 border-red-500 bg-red-50 ring-2 ring-red-200' 
                        : 'border-2 border-gray-200 bg-white hover:border-blue-400 hover:shadow-md'
                    } rounded-xl p-4 group`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <span className={`text-lg font-medium ${
                        warnFrom ? 'text-red-700' : 'text-gray-900'
                      } ${isSwapping ? 'opacity-70' : ''}`}>
                        {formatStationDisplay(from)}
                      </span>
                    </div>
                    {warnFrom && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        请选择出发地
                      </div>
                    )}
                  </div>
                </div>

                {/* 交换按钮 */}
                <div className="py-4">
                  <button
                    type="button" // 明确指定类型为button
                    onClick={handleSwapStations}
                    disabled={isSwapping}
                    className="relative group p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 disabled:opacity-50"
                  >
                    <div className="items-center justify-center flex w-8 h-8">
                      <ArrowRightLeft className={`h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors ${
                        isSwapping ? 'animate-spin' : ''
                      }`} />
                    </div>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-blue-600 whitespace-nowrap">交换车站</span>
                    </div>
                  </button>
                </div>

                {/* 目的地 */}
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-green-600" />
                    目的地
                  </label>
                  <div
                    onClick={() => handleSearch('end')}
                    className={`relative cursor-pointer transition-all duration-300 ${
                      warnTo 
                        ? 'border-2 border-red-500 bg-red-50 ring-2 ring-red-200' 
                        : 'border-2 border-gray-200 bg-white hover:border-green-400 hover:shadow-md'
                    } rounded-xl p-4 group`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <span className={`text-lg font-medium ${
                        warnTo ? 'text-red-700' : 'text-gray-900'
                      } ${isSwapping ? 'opacity-70' : ''}`}>
                        {formatStationDisplay(to)}
                      </span>
                    </div>
                    {warnTo && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        请选择目的地
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 日期选择器 */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                  出发日期
                </label>
                <div className={`rounded-xl p-1 transition-all duration-300 ${
                  warnDate ? 'bg-red-50 ring-2 ring-red-200' : ''
                }`}>
                  <MyDatePicker
                    setWarn={setWarnData}
                    warn={warnDate}
                    value={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date);
                      setWarnData(false);
                    }}
                    minDate={new Date()}
                    maxDate={after15Days}
                    placeholder={warnDate ? '请选择日期' : '选择出发日期'}
                    className="w-full"
                  />
                </div>
                {warnDate && (
                  <div className="text-red-500 text-sm mt-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    请选择出发日期
                  </div>
                )}
              </div>
            </div>

            {/* 搜索按钮 */}
            <div className="text-center">
              <button
                type="button" // 改为type="button"防止触发表单提交
                onClick={handleSubmit} // 直接使用handleSubmit
                disabled={loading}
                className="relative group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-12 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <div className="flex items-center justify-center">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      搜索中...
                    </>
                  ) : (
                    <>
                      <Search className="h-6 w-6 mr-3" />
                      搜索车票
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="animate-ping absolute h-8 w-8 rounded-full bg-white opacity-20"></div>
                      </div>
                    </>
                  )}
                </div>
              </button>
              
              {/* 提示信息 */}
              <p className="text-gray-500 text-sm mt-4">
                {from.stationId !== -1 && to.stationId !== -1 && selectedDate && (
                  `准备查询 ${from.stationName} → ${to.stationName} 的车次`
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {todayOrders.length > 0 && (
        <div className="relative z-10 w-full max-w-4xl mx-auto mt-6">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              今日行程
            </h3>
            
            <div className="space-y-4">
              {todayOrders.map((order, index) => {
                const statusInfo = getStatusInfo(order.orders.status);
                const startTime = new Date(order.startTime);
                const arrivalTime = new Date(order.arrivalTime);
                
                return (
                  <div 
                    key={order.ouid || index}
                    onClick={() => setLocation(`/order/${order.orders.orderId}`)}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="font-semibold text-lg text-gray-900">
                            {order.orders.from.stationName} → {order.orders.to.stationName}
                          </span>
                          <span className={`ml-3 text-xs px-2 py-1 rounded-full ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <Train className="h-4 w-4 mr-1" />
                          {order.orders.train.trainNo}次列车
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          ¥{order.orders.totalPrice}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getSeatClassText(order.seat.seatClass)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm font-medium">
                          {formatTime(startTime)} - {formatTime(arrivalTime)}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm text-gray-600 mr-4">
                          {order.passenger.name}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {order.seat.carriageNumber}车{order.seat.seatNumber}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                      <div className="flex items-center text-blue-600 text-sm">
                        查看详情
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SearchForm;