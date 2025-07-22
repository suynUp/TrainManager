import React from 'react';
import { CheckCircle2, Download, Eye, Home, Calendar, MapPin, Clock } from 'lucide-react';

const BookingSuccess = ({
  bookingId,
  train,
  passengers,
  seats,
  onBackToHome,
  onViewOrders,
}) => {
  const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);

  const handleDownloadTicket = () => {
    // 模拟下载电子票
    const ticketData = {
      bookingId,
      train: train.trainNumber,
      passengers: passengers.map(p => p.name),
      seats: seats.map(s => `${s.carNumber}车${s.seatNumber}`),
      totalPrice,
      date: new Date().toLocaleDateString(),
    };
    
    const dataStr = JSON.stringify(ticketData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `火车票_${bookingId}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* 成功提示 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">预订成功！</h1>
          <p className="text-green-100">您的车票已成功预订，祝您旅途愉快</p>
        </div>

        {/* 订单信息 */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">订单详情</h2>
              <span className="text-sm text-gray-500">订单号: {bookingId}</span>
            </div>
            
            {/* 车次信息 */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {train.trainNumber}
                  </span>
                  <span className="text-sm text-gray-600">
                    {new Date().toLocaleDateString()} ({new Date().toLocaleDateString('zh-CN', { weekday: 'long' })})
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {train.departureTime}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {train.departureStation.name}
                    </div>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <div className="w-8 h-px bg-gray-300"></div>
                    <Clock className="h-4 w-4 mx-2" />
                    <div className="w-8 h-px bg-gray-300"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {train.arrivalTime}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {train.arrivalStation.name}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">历时</div>
                  <div className="font-medium">{train.duration}</div>
                </div>
              </div>
            </div>

            {/* 乘客和座位信息 */}
            <div className="space-y-3 mb-6">
              <h3 className="font-medium text-gray-900">乘客信息</h3>
              {passengers.map((passenger, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{passenger.name}</div>
                    <div className="text-sm text-gray-600">
                      {passenger.idNumber.replace(/^(.{6}).*(.{4})$/, '$1****$2')} · 
                      {passenger.passengerType === 'adult' ? ' 成人' : 
                       passenger.passengerType === 'child' ? ' 儿童' : ' 学生'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {seats[index]?.carNumber}车 {seats[index]?.seatNumber}
                    </div>
                    <div className="text-sm text-gray-600">
                      ¥{seats[index]?.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 价格汇总 */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">票价合计</span>
                <span className="font-medium">¥{totalPrice}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">手续费</span>
                <span className="font-medium">¥0</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 pt-2">
                <span>总计</span>
                <span className="text-green-600">¥{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* 重要提示 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-yellow-800 mb-2">重要提示</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 请携带有效身份证件原件进站乘车</li>
              <li>• 建议提前30分钟到达车站</li>
              <li>• 可通过12306官网或车站窗口取票</li>
              <li>• 如需改签或退票，请遵循相关规定</li>
            </ul>
          </div>

          {/* 操作按钮 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleDownloadTicket}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              下载电子票
            </button>
            
            <button
              onClick={onViewOrders}
              className="flex items-center justify-center px-4 py-3 border border-blue-300 rounded-md text-blue-700 hover:bg-blue-50 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              查看订单
            </button>
            
            <button
              onClick={onBackToHome}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              返回首页
            </button>
          </div>
        </div>
      </div>

      {/* 温馨提示 */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
        <h4 className="font-medium text-gray-900 mb-2">温馨提示</h4>
        <p className="text-sm text-gray-600">
          您已成功预订车票，预订信息已发送至您的手机。如有疑问，请拨打客服热线：12306
        </p>
      </div>
    </div>
  );
};

export default BookingSuccess;