import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Calendar, Download } from 'lucide-react';
import OrdersList from './OrdersList';
import TimeFilter from './TimeFilter';
import { useAtom } from 'jotai';
import { statusAtom, userIdAtom } from '../../AtomExport';
import { get } from '../../../utils/request';
import { toast, ToastContainer } from 'react-toastify';
import { fixSpringBootTime } from '../../../utils/fixTime';

const OrdersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useAtom(statusAtom);
  const [userId] = useAtom(userIdAtom);
  const [orders, setOrders] = useState([]);
  const [mergedOrders, setMergedOrders] = useState([]);
  const [showOrders, setShowOrders] = useState([]);
  const [prevStatus, setPrevStatus] = useState('all');
  const [isScrolled, setIsScrolled] = useState(false);
  const [shouldFixed, setShouldFixed] = useState(false)
  const [timeFilter, setTimeFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const inpRef = useRef();
  const [trigger,setTrigger] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setShouldFixed(scrollTop>280)
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const getOrder = async () => {
      setIsLoading(true);
      try {
        const res = await get("/orderMessage/get", { userId, orderId: -1 ,searchQuery});
        if (res.code === 200) {
          console.log(res.data.map(r => {return {...r,orders:{...r.orders,arrivalTime:fixSpringBootTime(r.orders.arrivalTime),startTime:fixSpringBootTime(r.orders.startTime)}}}))
          setOrders(res.data.map(r => {return {...r,orders:{...r.orders,arrivalTime:fixSpringBootTime(r.orders.arrivalTime),startTime:fixSpringBootTime(r.orders.startTime)}}}));
          // 合并相同订单ID的数据
          const merged = mergeOrders(res.data.map(r => {return {...r,orders:{...r.orders,arrivalTime:fixSpringBootTime(r.orders.arrivalTime),startTime:fixSpringBootTime(r.orders.startTime)}}}));
          setMergedOrders(merged);
        } else {
          setOrders([]);
          setMergedOrders([]);
        }
      } catch (error) {
        console.error('获取订单失败:', error);
        setOrders([]);
        setMergedOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    getOrder();
  }, [userId,trigger,searchQuery]);

  // 合并相同订单ID的数据
  const mergeOrders = (ordersData) => {
    if (!ordersData || ordersData.length === 0) return [];
    
    const orderMap = new Map();
    
    ordersData.forEach(item => {
      const orderId = item.orders.orderId;
      
      if (!orderMap.has(orderId)) {
        // 创建新的合并订单对象
        orderMap.set(orderId, {
          orders: item.orders,
          passengers: [item.passenger],
          seats: [item.seat],
          ouids: [item.ouid]
        });
      } else {
        // 添加到现有订单
        const existingOrder = orderMap.get(orderId);
        existingOrder.passengers.push(item.passenger);
        existingOrder.seats.push(item.seat);
        existingOrder.ouids.push(item.ouid);
      }
    });
    
    return Array.from(orderMap.values());
  };

  useEffect(() => {
    let filtered = mergedOrders;
    
    if (status !== 'all') {
      filtered = filtered.filter(order => order.orders.status === status);
    }
    
    if (timeFilter !== 'all') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orders.startTime);
        const now = new Date();
        
        switch (timeFilter) {
          case 'today':
            return isToday(order.orders.startTime);
          case 'week':
            return isWithinLast7Days(order.orders.startTime);
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          case '3months':
            const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            return orderDate >= threeMonthsAgo;
          default:
            return true;
        }
      });
    }
    
    // if (searchQuery) {
    //   const query = searchQuery.toLowerCase();
    //   filtered = filtered.filter(order => 
    //     order.orders.orderId.toString().includes(query) ||
    //     order.orders.train.trainNo.toLowerCase().includes(query) ||
    //     order.passengers.some(p => p.name.toLowerCase().includes(query)) ||
    //     order.orders.from.stationName.toLowerCase().includes(query) ||
    //     order.orders.to.stationName.toLowerCase().includes(query)
    //   );
    // }
    
    setShowOrders(filtered);
  }, [mergedOrders, status, timeFilter, searchQuery]);

  const statusList = [
    { sta: 'all', title: '全部订单', icon: '📋' },
    { sta: 'PENDING', title: '待支付', icon: '⏳' },
    { sta: 'PAID', title: '已支付', icon: '✅' },
    { sta: 'COMPLETED', title: '已完成', icon: '🎉' },
    { sta: 'CANCELLED', title: '已取消', icon: '❌' }
  ];

  const isToday = (timeStamp) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const orderDate = new Date(timeStamp);
    return orderDate >= today && orderDate < tomorrow;
  };

  const isWithinLast7Days = (timeStamp) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const orderDate = new Date(timeStamp);
    return orderDate >= sevenDaysAgo && orderDate <= now;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatus('all');
    setTimeFilter('all');
    if (inpRef.current) inpRef.current.value = '';
  };

  return (
      <div>
        <ToastContainer />
        
        <div className={`rounded-[20px] mt-[10px] max-w-6xl mx-auto sticky top-4 z-50 bg-white/95 backdrop-blur-sm shadow-lg transition-all duration-300 ${isScrolled ? 'py-3' : 'py-6'}`}>
          <div className="px-4 flex">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">我的订单</h1>
                <p className="text-gray-600 text-sm mt-1">管理您的出行订单</p>
              </div>
            </div>

            {/* 搜索和过滤区域 */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              {/* <div className="flex-1 relative min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={inpRef}
                  type="text"
                  placeholder="搜索车次"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value !== '') {
                      if (status !== 'search') setPrevStatus(status);
                      setStatus('search');
                    } else {
                      setStatus(prevStatus);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div> */}

              {(searchQuery || status !== 'all' || timeFilter !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="ml-[80%] flex items-center px-4 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4 mr-1" />
                  清除筛选
                </button>
              )}
            </div>

            {/* 移动端时间筛选 */}
            {isFilterOpen && (
              <div className="md:hidden mt-4 p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border">
                <TimeFilter 
                  selectedOption={timeFilter}
                  onChange={setTimeFilter}
                />
              </div>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 侧边栏 - 状态筛选 */}
            <div className={`${shouldFixed?'fixed translate-y-[-280px]':''} lg:w-64 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-4 lg:h-fit`}>
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-3">订单状态</h3>
                <div className="space-y-1">
                  {statusList.map(sl => (
                    <button
                      key={sl.sta}
                      onClick={() => setStatus(sl.sta)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                        status === sl.sta
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-2">{sl.icon}</span>
                      {sl.title}
                      {status === sl.sta && (
                        <span className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>


              <div className="hidden md:block border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">时间范围</h3>
                <TimeFilter 
                  selectedOption={timeFilter}
                  onChange={setTimeFilter}
                />
              </div>
            </div>
                          
            {shouldFixed&&<div className='flex lg:w-64 lg:top-24 lg:h-fit'></div>}

            {/* 主内容区域 */}
            <div className="flex-1">
              {/* 统计信息 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{mergedOrders.length}</div>
                    <div className="text-sm text-gray-600">总订单</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {mergedOrders.filter(o => o.orders.status === 'PENDING').length}
                    </div>
                    <div className="text-sm text-gray-600">待支付</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {mergedOrders.filter(o => o.orders.status === 'PAID').length}
                    </div>
                    <div className="text-sm text-gray-600">已支付</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {mergedOrders.filter(o => o.orders.status === 'COMPLETED').length}
                    </div>
                    <div className="text-sm text-gray-600">已完成</div>
                  </div>
                </div>
              </div>

              {/* 订单列表 */}
              <div className=" backdrop-blur-sm rounded-lg shadow-sm">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">加载订单中...</p>
                  </div>
                ) : showOrders.length === 0 ? (
                  <div className="p-8 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订单</h3>
                    <p className="text-gray-600">
                      {searchQuery || status !== 'all' || timeFilter !== 'all'
                        ? '没有找到符合条件的订单'
                        : '您还没有任何订单记录'}
                    </p>
                    {(searchQuery || status !== 'all' || timeFilter !== 'all') && (
                      <button
                        onClick={clearFilters}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        清除筛选条件
                      </button>
                    )}
                  </div>
                ) : (
                  <OrdersList 
                    orders={showOrders}
                    onCancelOrder={async (orderId) => {
                      const res = await get('/order/cancel',{userId,orderId})
                        if(res.code == 200){
                          toast.success('成功了')
                          setTrigger(!trigger)
                        }else{
                          toast.error("失败啊")
                        }
                    }}
                    onRefundOrder={(orderId) => {
                      console.log('退款订单:', orderId);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default OrdersPage;