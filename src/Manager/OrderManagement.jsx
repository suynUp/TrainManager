import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2, Filter, Download } from 'lucide-react';
import { get } from '../utils/request';
import { useAtom } from 'jotai';
import { userIdAtom } from '../atoms/userAtoms';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [userId] = useAtom(userIdAtom)

  useEffect(() => {
    const getOrder = async () => {
      const res = await get("order/get", {userId})
      console.log(res)
      if(res.code == 200){
        setOrders(res.data);
        setFilteredOrders(res.data);
      }
    }
    getOrder()
  }, []);

  // 处理搜索和筛选
  useEffect(() => {
    let result = orders;
    
    // 状态筛选
    if (statusFilter !== 'ALL') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // 搜索筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.user.real_name.toLowerCase().includes(term) ||
        order.train.trainNo.toLowerCase().includes(term) ||
        order.from.stationName.toLowerCase().includes(term) ||
        order.to.stationName.toLowerCase().includes(term)
      );
    }
    
    setFilteredOrders(result);
  }, [orders, statusFilter, searchTerm]);

  // 格式化日期时间
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化状态显示
  const formatStatus = (status) => {
    const statusMap = {
      'PENDING': '待支付',
      'PAID': '已支付',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消'
    };
    return statusMap[status] || status;
  };

  // 取消订单
  const handleCancelOrder = (orderId) => {
    if (window.confirm('确定要取消此订单吗？')) {
      console.log('取消订单:', orderId);
      // 更新本地状态
      setOrders(orders.filter(order => order.orderId !== orderId));
    }
  };

  // 查看订单详情
  const handleViewDetails = (order) => {
    console.log('查看订单详情:', order);
    // 这里可以添加查看详情的逻辑，比如打开模态框或跳转到详情页
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
      </div>

      {/* 筛选和搜索区域 */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">状态筛选:</span>
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">全部状态</option>
              <option value="PENDING">待支付</option>
              <option value="PAID">已支付</option>
              <option value="COMPLETED">已完成</option>
              <option value="CANCELLED">已取消</option>
            </select>
          </div>
          
          <div className="relative max-w-xs w-full">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索乘客、车次或车站..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">乘客信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车次路线</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">#{order.orderId.toString().padStart(6, '0')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 text-sm font-medium">{order.user.real_name.charAt(0)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 block">{order.user.real_name}</span>
                          <span className="text-sm text-gray-600">{order.user.idCard}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.train.trainNo}次</p>
                        <p className="text-sm text-gray-600">
                          {order.from.stationName} → {order.to.stationName}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900">发车: {formatDateTime(order.startTime)}</p>
                        <p className="text-sm text-gray-600">到达: {formatDateTime(order.arrivalTime)}</p>
                        <p className="text-xs text-gray-500 mt-1">时长: {order.duration}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">¥{order.totalPrice}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'PENDING' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : order.status === 'PAID'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleViewDetails(order)}
                        className="text-blue-600 hover:text-blue-900 mr-3 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        详情
                      </button>
                      {order.status === 'PENDING' && (
                        <button 
                          onClick={() => handleCancelOrder(order.orderId)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          取消
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'ALL' 
                      ? '没有找到符合条件的订单' 
                      : '暂无订单数据'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OrderManagement;