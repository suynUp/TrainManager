import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, ArrowRight, Route, Clock, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import TrainRoutesDisplay from '../components/TrainRoutesDisplay';
import { useAtom } from 'jotai';
import { userIdAtom } from '../atoms/userAtoms';
import { get, post } from '../utils/request';

const mockStations = [
  { stationId: 1, stationName: '北京南', stationCode: 'BJS' },
  { stationId: 2, stationName: '上海虹桥', stationCode: 'SHH' },
  { stationId: 3, stationName: '杭州东', stationCode: 'HZD' },
  { stationId: 4, stationName: '南京南', stationCode: 'NJS' },
  { stationId: 5, stationName: '天津西', stationCode: 'TJX' },
  { stationId: 6, stationName: '济南西', stationCode: 'JNX' },
];

function RouteManagement() {

  const [userId] = useAtom(userIdAtom)

  const [stations,setStations] = useState(mockStations)
  const [trains,setTrains] = useState()
  const [routes, setRoutes] = useState([]);

  const [trigger,setTrigger] = useState(false)

  const [showAddModal, setShowAddModal] = useState(false);
  const [trainId,setTrainId] = useState()
  const [newRoute, setNewRoute] = useState({
    trainCode:'',
    train:{},
    stations: '',
    distance: '',
    duration: ''
  });
  const [addRoute,setAddRoute] = useState([

  ])

  useEffect(() => {
    const getStation = async () => {
      const res = await get("/station/search",{stationName:'',userId})
      if(res.code == 200){
        setStations(res.data)
      }else{
        toast("失败啊")
      }
    }
    const getTrains = async () => {
      try {
        const res = await get("/train/get", { managerId:userId, key:'' });
        if (res.code === 200) {
          setTrains(res.data);
          setNewRoute({...newRoute,trainCode:res.data[0].trainCode,train:res.data[0]})
        } else {
          toast.error("获取车辆列表失败");
        }
      } catch (error) {
        toast.error("网络错误");
      }
    };
   
    getStation()
    getTrains()

  },[])

  useEffect(()=>{
    setTrains(trains?.filter(t=>routes?.some(r=>r.train.trainId!==t.trainId)))
  },[routes])

  useEffect(()=>{
    const getRoute = async () => {
      const res = await get("/trainRoute/getAll",{userId})
      if(res.code){
                console.log(res.data)

        setRoutes(res.data)
      }
    }
    getRoute()
  },[trigger])

  const handleStationSelect = (station) => {

    if(addRoute.filter(r => r.stationId === station.id).length === 0){
      setAddRoute([...addRoute,
        {
          stationId:station.stationId,
          arrivalTime:new Date(),
          distanceFromStart:200,//距离上一个车站的路程
          stopDuration:7 //分钟
        }
      ])
    }

    if (!newRoute.stations.includes(station)) {
      setNewRoute({
        ...newRoute,
        stations: [...newRoute.stations, station]
      });
    }
  };

  const removeStation = (index,stationId) => {
    const updatedStations = newRoute.stations.filter((_, i) => i !== index);
    setNewRoute({ ...newRoute, stations: updatedStations });

    const updatedAdd = addRoute.filter(r => r.stationId !== stationId)
    setAddRoute(updatedAdd)
  };

  const trainSelect = (e) => {
    setTrainId(parseInt(e.target.value))
    const train = trains.filter(tr =>tr.trainId == e.target.value)
    setNewRoute({...newRoute,trainCode:e.target.value,train:train[0]})
  }

  
  const handleAddRoute = async () => {//还没完全
    
    const res = await post("trainRoute/add",addRoute.map(
      (r,index)=>{
        if(index === 0){
          r.distanceFromStart = null
          r.arrivalTime = null
        }
       r.stationSequence = index
       return r
    }
    ),{userId,trainId})
      
    if(res.code == 200){
      toast.success("成功了")
      setShowAddModal(false);
      setNewRoute({...newRoute,stations:[]})
      setTrigger(!trigger)
    }else{
      toast.error("失败啊")
    }
    
  };

  // 安全的格式化函数
  const formatForDateTimeInput = (dateTimeValue) => {
    // 检查是否为 null 或 undefined
    if (dateTimeValue == null) return '';
    
    // 如果是数字，可能是时间戳
    if (typeof dateTimeValue === 'number') {
      try {
        return new Date(dateTimeValue).toISOString().slice(0, 16);
      } catch (error) {
        return '';
      }
    }
    
    // 如果是字符串，进行安全处理
    if (typeof dateTimeValue === 'string') {
      // 检查是否已经是正确的格式
      if (dateTimeValue.includes('T') && dateTimeValue.length >= 16) {
        return dateTimeValue.slice(0, 16);
      }
      
      // 尝试解析其他格式的日期字符串
      try {
        const date = new Date(dateTimeValue);
        if (!isNaN(date.getTime())) {
          return date.toISOString().slice(0, 16);
        }
      } catch (error) {
        // 解析失败，返回空字符串
      }
    }
    
    // 如果是其他类型（如对象），尝试转换为字符串
    if (typeof dateTimeValue === 'object') {
      try {
        const dateStr = String(dateTimeValue);
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString().slice(0, 16);
        }
      } catch (error) {
        // 转换失败
      }
    }
    
    return '';
  };

// 移除 parseDateTimeInput 函数，直接在 onChange 中处理

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">路线管理</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>创建路线</span>
        </button>
      </div>

      {/* 创建路线模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">创建新路线</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">车辆绑定</label>
                <select
                  type="text"
                  value={newRoute.trainCode}
                  onChange={(e) => {trainSelect(e)}}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {trains.map(tr =><option key={tr.trainId} value={tr.trainId}>
                    {tr.trainNo}
                  </option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择车站</label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {stations.map(station => (
                    <button
                      key={station.stationId}
                      onClick={() => handleStationSelect(station)}
                      className="text-left p-2 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <span className="font-medium">{station.stationName}</span>
                      <span className="text-sm text-gray-500 ml-2">({station.stationCode})</span>
                    </button>
                  ))}
                </div>
                
                {newRoute.stations.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">已选择的车站路径：</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {newRoute.stations.map((station, index) => (
                        <React.Fragment key={index}>
                          <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            <span className='w-[85px]'>{station.stationName}</span>
                             {index === 0 ?//第一个
                             <div className='full flex'><div className='flex-1 ml-[40px] text-center pt-[20px] text-green-500'>始发站</div>
                             <div className='flex-1 ml-[60px]'>
                                <label className="block text-sm font-medium text-gray-700 mb-1">出发时间</label>
                                <input
                                  type="datetime-local"
                                  value={formatForDateTimeInput(addRoute[0]?.departureTime)}
                                  onChange={(e) => {
                                    const dateValue = e.target.value;
                                    setAddRoute(addRoute.map((r, i) => 
                                      0 === i ? { ...r, departureTime: dateValue ? `${dateValue}:00` : '' } : r
                                    ));
                                  }}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div></div>
                              ://中间
                              (<div className="flex grid-cols-2 gap-4 ml-[10px]">
                                                              
                              {index !== newRoute.stations.length-1 ?
                             <div className='flex-1'>
                              <label className="block text-sm font-medium text-gray-700 mb-1">停靠时间(min)</label>
                              <input
                                type="number"
                                max={60}
                                value={addRoute[index].stopDuration}
                                onChange={(e) => {
                                  // 只允许数字输入
                                  const numericValue = e.target.value.replace(/[^\d]/g, '');
                                  setAddRoute(addRoute.map((r, i) => 
                                    index === i ? {...r, stopDuration: numericValue} : r
                                  ));
                                }}
                                placeholder="如：10"
                                min="0"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>:<div className='flex-1 text-center text-red-500 pt-[20px]'>终点站</div>}
                              <div className='flex-1'>
                                <label className="block text-sm font-medium text-gray-700 mb-1">到达时间</label>
                                <input
                                  type="datetime-local"
                                  value={formatForDateTimeInput(addRoute[index]?.arrivalTime)}
                                  onChange={(e) => {
                                    const dateValue = e.target.value;
                                    setAddRoute(addRoute.map((r, i) => 
                                      index === i ? { ...r, arrivalTime: dateValue ? `${dateValue}:00` : '' } : r
                                    ));
                                  }}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <div className='flex-1'>
                                <label className="block text-sm font-medium text-gray-700 mb-1">与上一站距离(km)</label>
                                <input
                                  type="number"
                                  value={addRoute[index].distanceFromStart}
                                  onChange={(e) => setAddRoute(addRoute.map((r,i)=>index === i?{...r,distanceFromStart: e.target.value}:r))}
                                  placeholder="如：1318"
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          )}
                           <button
                              onClick={() => removeStation(index,station.stationId)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                         
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddRoute}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                创建路线
              </button>
              <button
                onClick={() => {
                  setNewRoute({...newRoute,stations:[]})
                  setShowAddModal(false)}}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer/>
      <TrainRoutesDisplay 
      routes={routes}
      ></TrainRoutesDisplay>
    </div>
  );
}

export default RouteManagement;
