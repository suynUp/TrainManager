import React, { useState, useEffect } from 'react';
import { Clock, MapPin, ArrowRight, ArrowLeft, X, AlertCircle  } from 'lucide-react';
import { useLocation } from 'wouter';
import FilterToggle from './FilterToggle';
import { useAtom } from 'jotai';
import { trainAtom, userAtom, seatTypeAtom, fromAtom ,toAtom ,dateAtom } from '../AtomExport';
import { get } from '../../utils/request';

const TrainList = () => {

  const [user] = useAtom(userAtom);

  const [from] = useAtom(fromAtom)
  const [to] = useAtom(toAtom)
  const [date] = useAtom(dateAtom)

  const [, setTrainAtom] = useAtom(trainAtom);
  const [, setSeatType] = useAtom(seatTypeAtom);
  const [, setLocation] = useLocation();
  const [goToAuth,setGoToAuth] = useState(false)

  const [body,setBody] = useState()
  
  const [filters, setFilters] = useState({
    selectedDate: new Date().toISOString().split('T')[0],
    timeRange: 'all',
    trainTypes: [],
    showSidebar: false
  });

  // 假设这是从API获取的数据
  const [routeData, setRouteData] = useState([
    {
      "from": {
        "routeId": 7,
        "train": {
          "trainId": 1,
          "trainNo": "G101",
          "trainType": "G",
          "isActive": true
        },
        "station": {
          "stationId": 3,
          "stationName": "济南西站",
          "city": "济南",
          "province": "山东省",
          "stationCode": "JNX",
          "status": "IN_OPERATION"
        },
        "stationSequence": 0,
        "departureTime": "2025-08-22T02:11:00",
        "arrivalTime": null,
        "stopDuration": 7,
        "distanceFromStart": null
      },
      "to": {
        "routeId": 9,
        "train": {
          "trainId": 1,
          "trainNo": "G101",
          "trainType": "G",
          "isActive": true
        },
        "station": {
          "stationId": 6,
          "stationName": "广州南站",
          "city": "广州",
          "province": "广东省",
          "stationCode": "IZQ",
          "status": "IN_OPERATION"
        },
        "stationSequence": 2,
        "departureTime": "2025-08-22T04:24:00",
        "arrivalTime": "2025-08-22T04:17:00",
        "stopDuration": 7,
        "distanceFromStart": 200
      },
      "businessavailable": 1,
      "firstticketPrice": 296,
      "secondticketPrice": 160,
      "businessticketPrice": 552,
      "firstavailable": 0,
      "secondavailable": 0
    }
  ]);

  const getTrainTypeName = (type) => {
    const typeMap = {
      'G': '高速动车',
      'D': '动车',
      'C': '城际',
      'Z': '直达',
      'T': '特快',
      'K': '快速',
    };
    return typeMap[type] || '其他';
  };

  const getTrainTypeColor = (type) => {
    const colorMap = {
      'G': 'bg-gradient-to-r from-red-500 to-red-600 text-white',
      'D': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      'C': 'bg-gradient-to-r from-green-500 to-green-600 text-white',
      'Z': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      'T': 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
      'K': 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
    };
    return colorMap[type] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  };

  function isBeforeArrivalTime(time) {
  // 将字符串时间转换为Date对象
  const arrivalDate = new Date(time);
  // 获取当前时间
  const now = new Date();
  
  // 比较当前时间是否早于到达时间
  return now < arrivalDate;
}

  // 格式化时间，只显示时分
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '--:--';
    const date = new Date(dateTimeString);
    return date.toTimeString().slice(0, 5);
  };

  // 计算历时
  const calculateDuration = (departureTime, arrivalTime) => {
    if (!departureTime || !arrivalTime) return '--:--';
    const dep = new Date(departureTime);
    const arr = new Date(arrivalTime);
    const diff = arr - dep;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  useEffect(()=>{
    const getRoute = async () => {

      const searchParams = new URLSearchParams(window.location.search);

      if(searchParams){
        const res = await get("/trainRoute/findDirectRoutes",{
          fromId:searchParams.get("fromId"),
          toId:searchParams.get("toId"),
          travelDate:searchParams.get("date")
        })
        if(res.code == 200){
          console.log(res.data)
          setRouteData(res.data.map(t=>{return {
            ...t,
            from:{
              ...t.from,
              departureTime:add8Hours(t.from.departureTime)
            },
            to:{
              ...t.to,
              arrivalTime:add8Hours(t.to.arrivalTime)
            }
          }}))
        }else{
          setRouteData([])
        }
      }else{
        setLocation("/")
      }
    }
    getRoute()
  },[date])

  function add8Hours(date) {
    if (!date) return null;
    
    const d = new Date(date);
    d.setHours(d.getHours() + 8);
    return d;
  }
  const goBack = () => {
    setLocation('/');
  };

  const onSelectTrain = (route, seatType) => {
    console.log('Selected route:', route, 'seat type:', seatType);
    setTrainAtom(route);
    setSeatType(seatType);

    console.log(user)
    if (JSON.stringify(user) === '{}') {
      setLocation('/Login');
    } else if(!user.real_name){
      setGoToAuth(true)
    }else{
      setLocation('/SeatSelection');
    }
  };

  if (routeData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md mx-auto">
          <div className='absolute top-6 left-6'>
            <ArrowLeft className='w-8 h-8 cursor-pointer text-gray-600 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all duration-200' onClick={goBack}/>  
          </div>
          <div className="text-gray-500 mb-4">
            <Clock className="h-16 w-16 mx-auto mb-6 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">暂无符合条件的车票</h2>
          </div>
        </div>
      </div>
    ); 
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <FilterToggle filters={filters} setFilters={setFilters} />

      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div id='top' className="transition-all duration-500 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl shadow-xl">
          <div className="flex items-center p-6">
            <button 
              onClick={goBack}
              className="mr-4 text-white hover:text-blue-200 hover:scale-110 active:scale-95 transition-all duration-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="text-white">
              <h1 className="text-2xl font-bold mb-1">列车查询结果</h1>
              <p className="text-blue-100">为您找到最优出行方案</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-xl">
          {/* Results Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  共找到 <span className="text-blue-600">{routeData.length}</span> 趟列车
                </h3>
                <p className="text-gray-600">
                  点击选座购票开始预订 • 实时更新座位信息
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                  有票
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                  售罄
                </div>
              </div>
            </div>
          </div>

          {/* Route List */}
          <div className="space-y-1">
            {routeData.map((route, index) => (
              <div 
                key={index} 
                className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-300 group"
              >
                <div className="p-6">
                  {/* Train Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${getTrainTypeColor(route.from.train.trainType)}`}>
                        {route.from.train.trainNo}
                      </span>
                      <div className="hidden md:block">
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {getTrainTypeName(route.from.train.trainType)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">历时</div>
                      <div className="text-lg font-semibold text-gray-700">
                        {calculateDuration(route.from.departureTime, route.to.arrivalTime)}
                      </div>
                    </div>
                  </div>

                  {/* Time and Stations */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          {formatTime(route.from.departureTime)}
                        </div>
                        <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                          <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium">{route.from.station.stationName}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-400 px-4">
                        <div className="w-12 h-px bg-gradient-to-r from-blue-300 to-blue-500"></div>
                        <div className="mx-3 p-2 bg-blue-100 rounded-full">
                          <ArrowRight className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="w-12 h-px bg-gradient-to-r from-blue-500 to-blue-300"></div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          {formatTime(route.to.arrivalTime)}
                        </div>
                        <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                          <MapPin className="h-4 w-4 mr-2 text-green-500" />
                          <span className="font-medium">{route.to.station.stationName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seat Types */}
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* 商务座 */}
                    <div className={`border-2 rounded-xl p-5 transition-all duration-300 ${
                      route.businessavailable === 0
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-gray-200 hover:border-blue-400 hover:shadow-lg group-hover:border-blue-300'
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">商务座</div>
                          <div className={`text-sm flex items-center ${
                            route.businessavailable > 0 ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              route.businessavailable > 0 ? 'bg-green-400' : 'bg-gray-400'
                            }`}></div>
                            余票 {route.businessavailable} 张
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-400">
                            ¥{route.businessticketPrice}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onSelectTrain(route, 'businessClass')}
                        disabled={route.businessavailable === 0}
                        className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          route.businessavailable === 0
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:scale-105 active:scale-95'
                        }`}
                      >
                        {route.businessavailable === 0 ? '已售完' : '选座购票'}
                      </button>
                    </div>

                    {/* 一等座 */}
                    <div className={`border-2 rounded-xl p-5 transition-all duration-300 ${
                      route.firstavailable === 0
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-gray-200 hover:border-blue-400 hover:shadow-lg group-hover:border-blue-300'
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">一等座</div>
                          <div className={`text-sm flex items-center ${
                            route.firstavailable > 0 ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              route.firstavailable > 0 ? 'bg-green-400' : 'bg-gray-400'
                            }`}></div>
                            余票 {route.firstavailable} 张
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-400">
                            ¥{route.firstticketPrice}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onSelectTrain(route, 'firstClass')}
                        disabled={route.firstavailable === 0}
                        className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          route.firstavailable === 0
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:scale-105 active:scale-95'
                        }`}
                      >
                        {route.firstavailable === 0 ? '已售完' : '选座购票'}
                      </button>
                    </div>

                    {/* 二等座 */}
                    <div className={`border-2 rounded-xl p-5 transition-all duration-300 ${
                      route.secondavailable === 0
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-gray-200 hover:border-blue-400 hover:shadow-lg group-hover:border-blue-300'
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">二等座</div>
                          <div className={`text-sm flex items-center ${
                            route.secondavailable > 0 ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              route.secondavailable > 0 ? 'bg-green-400' : 'bg-gray-400'
                            }`}></div>
                            余票 {route.secondavailable} 张
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-400">
                            ¥{route.secondticketPrice}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onSelectTrain(route, 'secondClass')}
                        disabled={route.secondavailable === 0}
                        className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          route.secondavailable === 0
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:scale-105 active:scale-95'
                        }`}
                      >
                        {route.secondavailable === 0 ? '已售完' : '选座购票'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-b-2xl shadow-xl p-4">
          <div className="text-center text-blue-100 text-sm">
            数据实时更新 • 安全快捷预订
          </div>
        </div>

        {goToAuth&&<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl transform transition-all duration-300 scale-100 opacity-100">
        <X className='ml-[95%] hover:text-red-600 cursor-pointer hover:scale-105'
        onClick={() => setGoToAuth(false)}></X>
        {/* 图标和标题 */}
        <div className="flex items-center justify-center mb-4">
          <div className="bg-amber-100 p-3 rounded-full">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">需要认证</h3>
        <p className="text-gray-600 text-center mb-6">
          请先完成实名认证，才能继续操作哦
        </p>
        
        {/* 按钮组 */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setGoToAuth(false)}
            className="shadow-lg transition-all duration-500 flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-white rounded-lg font-medium hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-600 hover:scale-105 text-white flex items-center justify-center gap-2"
          >
            <X size={18} />
            取消
          </button>
          <button
            onClick={() => setLocation('/Auth')}
            className="shadow-lg transition-all duration-500 flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-white rounded-lg font-medium hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-600 hover:scale-105 text-white flex items-center justify-center gap-2 "
          >
            立即认证
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>}
      </div>
    </div>
  );
};

export default TrainList;