import React from 'react';
import { Calendar, MapPin, Clock, RefreshCw, X } from 'lucide-react';

const OrdersList = ({ orders, searchQuery, statusFilter, onCancelOrder, onRefundOrder }) => {
  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': { text: '待确认', color: 'text-yellow-600 bg-yellow-100' },
      'confirmed': { text: '已确认', color: 'text-green-600 bg-green-100' },
      'cancelled': { text: '已取消', color: 'text-red-600 bg-red-100' },
    };
    return statusMap[status] || { text: status, color: 'text-gray-600 bg-gray-100' };
  };

  const getPaymentStatusDisplay = (status) => {
    const statusMap = {
      'pending': { text: '待支付', color: 'text-orange-600 bg-orange-100' },
      'paid': { text: '已支付', color: 'text-green-600 bg-green-100' },
      'failed': { text: '支付失败', color: 'text-red-600 bg-red-100' },
    };
    return statusMap[status] || { text: status, color: 'text-gray-600 bg-gray-100' };
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.train.trainNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.passengers.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (filteredOrders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订单</h3>
        <p className="text-gray-600">
          {searchQuery || statusFilter !== 'all' ? '没有找到符合条件的订单' : '您还没有任何订单记录'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredOrders.map((order) => {
        const orderStatus = getStatusDisplay(order.status);
        const paymentStatus = getPaymentStatusDisplay(order.paymentStatus);
        
        return (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* 订单头部 */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">订单号:</span>
                  <span className="font-mono text-sm font-medium">{order.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${orderStatus.color}`}>
                    {orderStatus.text}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatus.color}`}>
                    {paymentStatus.text}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(order.bookingDate).toLocaleDateString()}
                </div>
              </div>

              {/* 车次信息 */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {order.train.trainNumber}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(order.bookingDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {order.train.departureTime}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {order.train.departureStation.name}
                      </div>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <div className="w-8 h-px bg-gray-300"></div>
                      <Clock className="h-4 w-4 mx-2" />
                      <div className="w-8 h-px bg-gray-300"></div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {order.train.arrivalTime}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {order.train.arrivalStation.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">历时</div>
                    <div className="font-medium">{order.train.duration}</div>
                  </div>
                </div>
              </div>

              {/* 乘客信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {order.passengers.map((passenger, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{passenger.name}</div>
                      <div className="text-sm text-gray-600">
                        {order.seats[index]?.carNumber}车 {order.seats[index]?.seatNumber}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        ¥{order.seats[index]?.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 价格和操作 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-bold text-gray-900">
                    总计: <span className="text-orange-600">¥{order.totalPrice}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {order.status === 'confirmed' && order.paymentStatus === 'paid' && (
                    <button
                      onClick={() => onRefundOrder(order.id)}
                      className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4 mr-1 inline" />
                      申请退票
                    </button>
                  )}
                  
                  {order.status === 'pending' && (
                    <button
                      onClick={() => onCancelOrder(order.id)}
                      className="px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <X className="h-4 w-4 mr-1 inline" />
                      取消订单
                    </button>
                  )}
                  
                  <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    查看详情
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrdersList;