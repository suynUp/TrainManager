import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const MyDatePicker = ({
  setWarn,
  warn,
  value,
  onChange,
  placeholder = '请选择日期',
  className = '',
  disabled = false,
  minDate,
  maxDate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(value) || new Date());
  const [selectedDate, setSelectedDate] = useState(new Date(value) || null);
  const containerRef = useRef(null);

  const months = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  // 点击外部关闭日历
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 获取当月的所有日期
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // 添加上个月的日期（灰色显示）
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    // 添加当月的日期
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const isToday = 
        currentDate.getDate() === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();
      
      const isSelected = selectedDate &&
        currentDate.getDate() === selectedDate.getDate() &&
        currentDate.getMonth() === selectedDate.getMonth() &&
        currentDate.getFullYear() === selectedDate.getFullYear();

      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday,
        isSelected: !!isSelected
      });
    }

    // 添加下个月的日期（灰色显示）
    const remainingDays = 42 - days.length; // 6行 × 7天
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    return days;
  };

  const handleDateSelect = (date) => {
    // 检查日期限制
    if (minDate && date < minDate) return;
    if (maxDate && date > maxDate) return;

    setSelectedDate(date);
    setWarn(false)
    onChange && onChange(date);
    setIsOpen(false);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const isDateDisabled = (date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const formatDate = (date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 日期输入框 */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 border-2 rounded-xl bg-white/70 backdrop-blur-sm
          flex items-center justify-between transition-all duration-200
          hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20
          ${warn?'border-red-500':''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-gray-200'}
        `}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className={selectedDate ? 'text-gray-900 font-medium' : 'text-gray-500'}>
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </span>
        </div>
        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {/* 日历弹窗 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 z-50 animate-scale-in">
          {/* 日历头部 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100/50">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Clock className="w-3 h-3 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {currentMonth.getFullYear()}年 {months[currentMonth.getMonth()]}
              </h3>
            </div>

            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-1 p-4 pb-2">
            {weekdays.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-1 p-4 pt-0">
            {days.map((day, index) => {
              const isDisabled = isDateDisabled(day.date);
              
              return (
                <button
                  key={index}
                  onClick={() => day.isCurrentMonth && !isDisabled && handleDateSelect(day.date)}
                  disabled={!day.isCurrentMonth || isDisabled}
                  className={`
                    h-10 w-10 rounded-xl text-sm font-medium transition-all duration-200
                    flex items-center justify-center relative overflow-hidden
                    ${day.isCurrentMonth 
                      ? isDisabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-900 hover:bg-blue-50 hover:scale-110 active:scale-95 cursor-pointer'
                      : 'text-gray-300 cursor-default'
                    }
                    ${day.isSelected 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700' 
                      : ''
                    }
                    ${day.isToday && !day.isSelected 
                      ? 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 border-2 border-orange-200' 
                      : ''
                    }
                  `}
                >
                  {day.date.getDate()}
                  {day.isToday && !day.isSelected && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-gray-100/50 p-4">
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => handleDateSelect(new Date())}
                className="px-4 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-100 transition-all duration-200 font-medium hover:scale-105 active:scale-95"
              >
                今天
              </button>
              <button
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  handleDateSelect(tomorrow);
                }}
                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-xl hover:from-blue-200 hover:to-blue-100 transition-all duration-200 font-medium hover:scale-105 active:scale-95"
              >
                明天
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDatePicker;