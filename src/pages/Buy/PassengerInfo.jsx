import React, { useState } from 'react';
import { ArrowLeft, Plus, X, User, Phone, CreditCard } from 'lucide-react';

const PassengerInfo = ({
  seats,
  onBack,
  onConfirm,
}) => {
  const [passengers, setPassengers] = useState(
    seats.map((seat, index) => ({
      id: `passenger-${index}`,
      name: '',
      idNumber: '',
      phone: '',
      passengerType: 'adult',
    }))
  );

  const [savedPassengers] = useState([
    {
      id: 'saved-1',
      name: '张三',
      idNumber: '110101199001011234',
      phone: '13800138000',
      passengerType: 'adult',
    },
    {
      id: 'saved-2',
      name: '李四',
      idNumber: '110101199002021234',
      phone: '13800138001',
      passengerType: 'adult',
    },
  ]);

  const handlePassengerChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index] = {
      ...newPassengers[index],
      [field]: value,
    };
    setPassengers(newPassengers);
  };

  const handleSelectSavedPassenger = (index, savedPassenger) => {
    const newPassengers = [...passengers];
    newPassengers[index] = {
      ...savedPassenger,
      id: `passenger-${index}`,
    };
    setPassengers(newPassengers);
  };

  const validatePassengers = () => {
    return passengers.every(p => p.name && p.idNumber && p.phone);
  };

  const handleSubmit = () => {
    if (validatePassengers()) {
      onConfirm(passengers);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* 头部 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            返回选座
          </button>
          <div className="text-sm text-gray-600">
            乘客信息填写
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">座位信息</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {seats.map((seat) => (
              <div key={seat.id} className="text-sm text-gray-600">
                {seat.carNumber}车 {seat.seatNumber}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 乘客信息表单 */}
      <div className="p-6 space-y-6">
        {passengers.map((passenger, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">
                乘客 {index + 1} - {seats[index].carNumber}车 {seats[index].seatNumber}
              </h4>
              {savedPassengers.length > 0 && (
                <div className="text-sm">
                  <span className="text-gray-600 mr-2">快速选择：</span>
                  {savedPassengers.map((saved) => (
                    <button
                      key={saved.id}
                      onClick={() => handleSelectSavedPassenger(index, saved)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      {saved.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={passenger.name}
                    onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入姓名"
                  />
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  身份证号
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={passenger.idNumber}
                    onChange={(e) => handlePassengerChange(index, 'idNumber', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入身份证号"
                  />
                  <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  手机号
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={passenger.phone}
                    onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入手机号"
                  />
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  乘客类型
                </label>
                <select
                  value={passenger.passengerType}
                  onChange={(e) => handlePassengerChange(index, 'passengerType', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="adult">成人</option>
                  <option value="child">儿童</option>
                  <option value="student">学生</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        {/* 联系人信息 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">联系人信息</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                联系人姓名
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入联系人姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                联系人手机
              </label>
              <input
                type="tel"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入联系人手机"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 底部确认按钮 */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            总价: ¥{seats.reduce((sum, seat) => sum + seat.price, 0)}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!validatePassengers()}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              validatePassengers()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            确认乘客信息
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassengerInfo;