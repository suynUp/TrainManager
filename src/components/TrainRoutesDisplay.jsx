import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Train, Clock, MapPin, Activity } from 'lucide-react';

const groupRoutesByTrainId = (routes) => {
  const grouped = routes.reduce((acc, route) => {
    const trainId = route.train.trainId;
    if (!acc[trainId]) {
      acc[trainId] = [];
    }
    acc[trainId].push(route);
    return acc;
  }, {});

  return Object.entries(grouped).map(([trainId, stops]) => ({
    trainId: parseInt(trainId),
    train: stops[0].train,
    stops: stops.sort((a, b) => a.stationSequence - b.stationSequence),
  }));
};

const formatTime = (timeString) => {
  if (!timeString) return '--:--';
  const date = new Date(timeString);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const getRouteStationsText = (stops) => {
  const sortedStops = [...stops].sort((a, b) => a.stationSequence - b.stationSequence);
  const firstStation = sortedStops[0]?.station.stationName || '';
  const lastStation = sortedStops[sortedStops.length - 1]?.station.stationName || '';
  
  if (sortedStops.length <= 2) {
    return `${firstStation} → ${lastStation}`;
  }
  
  return `${firstStation} → ... → ${lastStation} (${sortedStops.length}站)`;
};

const TrainRouteCard = ({ route }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTrainTypeColor = (trainType) => {
    switch (trainType) {
      case 'G':
        return 'bg-blue-600 text-white';
      case 'D':
        return 'bg-green-600 text-white';
      case 'C':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusColor = (status) => {
    return status === 'IN_OPERATION' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Header - Always Visible */}
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Train Number Badge */}
            <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${getTrainTypeColor(route.train.trainType)}`}>
              {route.train.trainNo}
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center space-x-1">
              <Activity size={16} className={route.train.isActive ? 'text-green-600' : 'text-red-600'} />
              <span className={`text-sm font-medium ${route.train.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {route.train.isActive ? '运行中' : '停运'}
              </span>
            </div>

            {/* Route Summary */}
            <div className="flex items-center space-x-1 text-gray-700">
              <Train size={16} />
              <span className="font-medium">{getRouteStationsText(route.stops)}</span>
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium">
            <span className="text-sm">{isExpanded ? '收起' : '展开'}</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Detailed Information - Expandable */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <MapPin size={18} />
              <span>详细行程</span>
            </h3>
            
            <div className="space-y-3">
              {route.stops.map((stop, index) => (
                <div key={stop.routeId} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
                  {/* Station Sequence */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                      {stop.stationSequence + 1}
                    </div>
                  </div>

                  {/* Station Info */}
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-800">{stop.station.stationName}</h4>
                      <div className={`text-xs px-2 py-1 rounded ${getStatusColor(stop.station.status) === 'text-green-600' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {stop.station.status === 'IN_OPERATION' ? '正常运营' : '停运'}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <span>{stop.station.city}, {stop.station.province}</span>
                      <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded">
                        {stop.station.stationCode}
                      </span>
                    </div>

                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} className="text-blue-600" />
                        <span className="text-gray-600">到达:</span>
                        <span className="font-medium">{formatTime(stop.arrivalTime)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock size={14} className="text-green-600" />
                        <span className="text-gray-600">出发:</span>
                        <span className="font-medium">{formatTime(stop.departureTime)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-600">停车:</span>
                        <span className="font-medium">{stop.stopDuration}分钟</span>
                      </div>
                      
                      {stop.distanceFromStart && (
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-600">距离:</span>
                          <span className="font-medium">{stop.distanceFromStart}km</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TrainRoutesDisplay = ({ routes }) => {
  const groupedRoutes = groupRoutesByTrainId(routes);

  if (groupedRoutes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚄</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">暂无路线数据</h2>
          <p className="text-gray-600">请稍后再试或联系管理员</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 rounded-[40px] shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🚄 列车路线管理</h1>
          <p className="text-lg text-gray-600">查看和管理所有列车路线信息</p>
          <div className="mt-4 text-sm text-gray-500">
            共 {groupedRoutes.length} 条路线
          </div>
        </div>

        {/* Route Cards */}
        <div className="space-y-6">
          {groupedRoutes.map((route) => (
            <TrainRouteCard key={route.trainId} route={route} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainRoutesDisplay ;