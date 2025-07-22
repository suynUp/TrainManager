import { Clock, MapPin, ArrowRight, ArrowLeft, Calendar, Filter, RotateCcw, Train, Zap } from 'lucide-react';

const FilterToggle = ({filters,setFilters}) => {

    const handleRefresh = () => {
    console.log('Refreshing trains...');
  };

  const handleDateChange = (date) => {
    setFilters(prev => ({ ...prev, selectedDate: date }));
  };

  const handleTimeRangeChange = (range) => {
    setFilters(prev => ({ ...prev, timeRange: range }));
  };

  const handleTrainTypeToggle = (type) => {
    setFilters(prev => ({
      ...prev,
      trainTypes: prev.trainTypes.includes(type)
        ? prev.trainTypes.filter(t => t !== type)
        : [...prev.trainTypes, type]
    }));
  };

  const toggleSidebar = () => {
    setFilters(prev => ({ ...prev, showSidebar: !prev.showSidebar }));
  };

  const timeRanges = [
    { value: 'all', label: '全天' },
    { value: 'morning', label: '06:00-12:00' },
    { value: 'afternoon', label: '12:00-18:00' },
    { value: 'evening', label: '18:00-24:00' }
  ];

  const trainTypeCategories = [
    { value: 'high-speed', label: '高铁/动车', types: ['G', 'D', 'C'], icon: <Zap className="w-4 h-4" /> },
    { value: 'regular', label: '普通列车', types: ['Z', 'T', 'K'], icon: <Train className="w-4 h-4" /> }
  ];

    return (<> <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${filters.showSidebar ? 'translate-x-0' : 'translate-x-[350px]'}`}>
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 max-h-[90vh] overflow-y-auto">
          {/* Sidebar Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                筛选条件
              </h3>
              <button
                onClick={toggleSidebar}
                className="text-white hover:text-blue-200 transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                出发日期
              </label>
              <input
                type="date"
                value={filters.selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Time Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-blue-600" />
                出发时间
              </label>
              <div className="space-y-2">
                {timeRanges.map((range) => (
                  <label key={range.value} className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="timeRange"
                      value={range.value}
                      checked={filters.timeRange === range.value}
                      onChange={(e) => handleTimeRangeChange(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 transition-all ${
                      filters.timeRange === range.value 
                        ? 'border-blue-600 bg-blue-600' 
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}>
                      {filters.timeRange === range.value && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <span className={`text-sm ${
                      filters.timeRange === range.value ? 'text-blue-600 font-medium' : 'text-gray-600'
                    }`}>
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Train Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Train className="w-4 h-4 mr-2 text-blue-600" />
                列车类型
              </label>
              <div className="space-y-3">
                {trainTypeCategories.map((category) => (
                  <div
                    key={category.value}
                    onClick={() => handleTrainTypeToggle(category.value)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      filters.trainTypes.includes(category.value)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`mr-3 p-2 rounded-lg ${
                        filters.trainTypes.includes(category.value)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {category.icon}
                      </div>
                      <span className={`font-medium ${
                        filters.trainTypes.includes(category.value) ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {category.label}
                      </span>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 transition-all ${
                      filters.trainTypes.includes(category.value)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {filters.trainTypes.includes(category.value) && (
                        <div className="w-3 h-3 bg-white rounded-sm m-0.5"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center font-medium"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              刷新列车信息
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      {!filters.showSidebar && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-2xl hover:bg-blue-700 transition-all duration-200 hover:scale-110"
        >
          <Filter className="w-6 h-6" />
        </button>
      )}</>)
}

export default FilterToggle