import React, { useState } from 'react';
import { Clock, MapPin, ArrowRight, ArrowLeft, Calendar, Filter, RotateCcw, Train, Zap } from 'lucide-react';
import { mockTrains } from '../../atoms/mockData';
import { useLocation } from 'wouter';
import FilterToggle from './FilterToggle';

const TrainList = () => {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState({
    selectedDate: new Date().toISOString().split('T')[0],
    timeRange: 'all',
    trainTypes: [],
    showSidebar: false
  });

  const trains = mockTrains;

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

  const getSeatTypeDisplay = (type) => {
    const typeMap = {
      'businessClass': '商务座',
      'firstClass': '一等座',
      'secondClass': '二等座',
      'hardSleeper': '硬卧',
      'softSleeper': '软卧',
    };
    return typeMap[type] || type;
  };

  const goBack = () => {
    setLocation('/');
  };

  const onSelectTrain = (train, type) => {
    console.log('Selected train:', train, 'seat type:', type);
  };

  if (trains.length === 0) {
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
      {/* Floating Sidebar */}
     
      <FilterToggle
      filters={filters}
      setFilters={setFilters}
      ></FilterToggle>

      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl shadow-xl">
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
                  共找到 <span className="text-blue-600">{trains.length}</span> 趟列车
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

          {/* Train List */}
          <div className="space-y-1">
            {trains.map((train) => (
              <div 
                key={train.id} 
                className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-300 group"
              >
                <div className="p-6">
                  {/* Train Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${getTrainTypeColor(train.type)}`}>
                        {train.trainNumber}
                      </span>
                      <div className="hidden md:block">
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {getTrainTypeName(train.type)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">历时</div>
                      <div className="text-lg font-semibold text-gray-700">{train.duration}</div>
                    </div>
                  </div>

                  {/* Time and Stations */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          {train.departureTime}
                        </div>
                        <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                          <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium">{train.departureStation.name}</span>
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
                          {train.arrivalTime}
                        </div>
                        <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                          <MapPin className="h-4 w-4 mr-2 text-green-500" />
                          <span className="font-medium">{train.arrivalStation.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seat Types */}
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {train.seats.map((seat) => (
                      <div
                        key={seat.type}
                        className={`border-2 rounded-xl p-5 transition-all duration-300 ${
                          seat.available === 0
                            ? 'border-gray-200 bg-gray-50'
                            : 'border-gray-200 hover:border-blue-400 hover:shadow-lg group-hover:border-blue-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="font-semibold text-gray-900 mb-1">
                              {getSeatTypeDisplay(seat.type)}
                            </div>
                            <div className={`text-sm flex items-center ${
                              seat.available > 0 ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                seat.available > 0 ? 'bg-green-400' : 'bg-gray-400'
                              }`}></div>
                              余票 {seat.available} 张
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-yellow-400">
                              ¥{seat.price}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => onSelectTrain(train, seat.type)}
                          disabled={seat.available === 0}
                          className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            seat.available === 0
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:scale-105 active:scale-95'
                          }`}
                        >
                          {seat.available === 0 ? '已售完' : '选座购票'}
                        </button>
                      </div>
                    ))}
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
      </div>
    </div>
  );
};

export default TrainList;