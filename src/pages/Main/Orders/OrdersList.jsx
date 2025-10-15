import { Calendar, MapPin, Clock, RefreshCw, X, User, Users } from 'lucide-react';
import { useLocation } from 'wouter';

const OrdersList = ({ orders, searchQuery, onCancelOrder, onRefundOrder }) => {
  const [, setLocation] = useLocation();

  // 格式化状态显示
  const getStatusDisplay = (status) => {
    const statusMap = {
      'PENDING': { text: '待支付', color: 'text-yellow-600 bg-yellow-100' },
      'PAID': { text: '已支付', color: 'text-green-600 bg-green-100' },
      'COMPLETED': { text: '已完成', color: 'text-blue-600 bg-blue-100' },
      'CANCELLED': { text: '已取消', color: 'text-red-600 bg-red-100' },
    };
    return statusMap[status] || { text: status, color: 'text-gray-600 bg-gray-100' };
  };

  // 格式化座位类型显示
  const formatSeatClass = (seatClass) => {
    const classMap = {
      'BUSINESS': '商务座',
      'FIRST': '一等座',
      'SECOND': '二等座'
    };
    return classMap[seatClass] || seatClass;
  };

  // 格式化乘客类型显示
  const formatPassengerType = (type) => {
    const typeMap = {
      'ADULT': '成人',
      'CHILD': '儿童',
      'STUDENT': '学生'
    };
    return typeMap[type] || type;
  };

  /**
 * 手动格式化日期时间（更可控）
 * @param {Date|string} dateTime - 日期时间
 * @returns {string} 格式化后的日期时间字符串
 */
const formatDateTime = (dateTime) => {
  if (!dateTime) return '--';
  
  const date = dateTime instanceof Date ? dateTime : new Date(dateTime);
  if (isNaN(date.getTime())) return '--';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * 手动格式化时间（仅时间部分）
 * @param {Date|string} dateTime - 日期时间
 * @returns {string} 格式化后的时间字符串
 */
const formatTimeOnly = (dateTime) => {
  console.log(dateTime)
  if (!dateTime) return '--:--';
  
  const date = dateTime instanceof Date ? dateTime : new Date(dateTime);
  if (isNaN(date.getTime())) return '--:--';
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

  // 安全的字符串转换和小写化
  const safeToLowerCase = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).toLowerCase();
  };

  // 过滤订单 - 适配合并后的数据结构
  const filteredOrders = orders.filter(orderData => {
    if (!orderData || !orderData.orders) return false;
    
    const order = orderData.orders;
    const passengers = orderData.passengers || [];
    
    const searchLower = safeToLowerCase(searchQuery);
    
    // 检查是否匹配搜索条件
    const matchesSearch = 
      safeToLowerCase(order.orderId).includes(searchLower) ||
      safeToLowerCase(order.train?.trainNo).includes(searchLower) ||
      passengers.some(p => safeToLowerCase(p.name).includes(searchLower)) ||
      safeToLowerCase(order.from?.stationName).includes(searchLower) ||
      safeToLowerCase(order.to?.stationName).includes(searchLower);
    
    return matchesSearch;
  });

  if (filteredOrders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订单</h3>
        <p className="text-gray-600">
          {searchQuery ? '没有找到符合条件的订单' : '您还没有任何订单记录'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredOrders.map((orderData, index) => {
        const order = orderData.orders || {};
        const passengers = orderData.passengers || [];
        const seats = orderData.seats || [];
        
        const orderStatus = getStatusDisplay(order.status);
        
        return (
          <div key={order.orderId || index} className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* 订单头部 */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">订单号:</span>
                  <span className="font-mono text-sm font-medium">
                    #{order.orderId ? order.orderId.toString().padStart(6, '0') : '--'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${orderStatus.color}`}>
                    {orderStatus.text}
                  </span>
                  <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    <Users className="h-3 w-3 mr-1" />
                    {passengers.length} 位乘客
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDateTime(order.startTime)}
                </div>
              </div>

              {/* 车次信息 */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {order.train?.trainNo || '--'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDateTime(order.startTime)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {formatTimeOnly(order.startTime)}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {order.from?.stationName || '--'}
                      </div>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <div className="w-8 h-px bg-gray-300"></div>
                      <Clock className="h-4 w-4 mx-2" />
                      <div className="w-8 h-px bg-gray-300"></div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {formatTimeOnly(order.arrivalTime)}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {order.to?.stationName || '--'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">历时</div>
                    <div className="font-medium">{order.duration || '--'}</div>
                  </div>
                </div>
              </div>

              {/* 乘客和座位信息 */}
              <div className="grid grid-cols-1 gap-3 mb-4">
                {passengers.map((passenger, idx) => {
                  const seat = seats[idx] || {};
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{passenger.name || '--'}</div>
                          <div className="text-sm text-gray-600">
                            {formatPassengerType(passenger.passengerType)} | {passenger.idCard || '--'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {seat.carriageNumber ? `${seat.carriageNumber}车` : ''}
                          {seat.seatNumber || '--'} 
                          {seat.seatClass && ` (${formatSeatClass(seat.seatClass)})`}
                        </div>
                        <div className="text-sm text-gray-600">
                          {seat.seatType === 'WINDOW' ? '靠窗' : seat.seatType === 'AISLE' ? '过道' : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 价格和操作 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-bold text-gray-900">
                    总计: <span className="text-orange-600">¥{order.totalPrice || '0.00'}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {order.status === 'PAID' && (
                    <button
                      onClick={() => onCancelOrder
                        (order.orderId)}
                      className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4 mr-1 inline" />
                      申请退票
                    </button>
                  )}
                  
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => onCancelOrder(order.orderId)}
                      className="px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <X className="h-4 w-4 mr-1 inline" />
                      取消订单
                    </button>
                  )}
                  
                  <button 
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      const query = new URLSearchParams({
                        orderId: order.orderId,
                      }).toString();
                      setLocation(`/OrderDetail?${query}`);
                    }}
                  >
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