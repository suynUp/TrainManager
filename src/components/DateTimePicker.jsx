import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

const DateTimePicker = ({ value, onChange, label = "出发时间", required = false }) => {
  const [date, setDate] = useState(value ? value.split('T')[0] : '');
  const [time, setTime] = useState(value ? value.split('T')[1].substring(0, 5) : '');

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    if (newDate && time) {
      onChange(`${newDate}T${time}:00`);
    }
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setTime(newTime);
    if (date && newTime) {
      onChange(`${date}T${newTime}:00`);
    }
  };

  const handleDateTimeChange = (dateTimeString) => {
    if (dateTimeString) {
      const [newDate, newTime] = dateTimeString.split('T');
      setDate(newDate);
      setTime(newTime ? newTime.substring(0, 5) : '');
    }
    onChange(dateTimeString);
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="flex space-x-2">
        {/* 日期选择 */}
        <div className="relative flex-1">
          <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            min={new Date().toISOString().split('T')[0]} // 不能选择过去的日期
          />
        </div>
        
        {/* 时间选择 */}
        <div className="relative flex-1">
          <Clock className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>
      
      {value && (
        <p className="text-sm text-gray-500">
          已选择: {new Date(value).toLocaleString('zh-CN')}
        </p>
      )}
    </div>
  );
};

export default DateTimePicker;