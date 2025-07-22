import React, { useState ,useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import OrdersStatuList from './OrdersStatusList';
import OrdersList from './OrdersList';
import { useAtom } from 'jotai';
import { statusAtom } from '../../AtomExport';

const OrdersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [ status, setStatus ] = useAtom(statusAtom)
  const [showOrders,setShowOrders] = useState([])
  const [prevStatus, setPrevStatus] = useState('all')

  const [isScrolled, setIsScrolled] = useState(false);

  const inpRef = useRef() 

  useEffect(() => {//挂载判断器
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 64);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(()=>{
    switch(status){
      case 'all':
        setShowOrders(orders)
        break;
      case 'pending':
        setShowOrders(orders.filter(or=>or.status==='pending'))
        break;
      case 'confirmed':
        setShowOrders(orders.filter(or=>or.status==='confirmed'))
        break;
      case 'canceled':
        setShowOrders(orders.filter(or=>or.status==='canceled'))
        break;
    }
  },[status])

  const statusList = [{
    sta:'all',
    title:'全部订单',
    onclick:()=>{setStatus('all')},
    className:''
  },{
    sta:'pending',
    title:'待确认  ',
    onclick:()=>{setStatus('pending')},
    className:''
  },{
    sta:'confirmed',
    title:'已确认  ',
    onclick:()=>{setStatus('confirmed')},
    className:''
  },{
    sta:'canceled',
    title:'已取消  ',
    onclick:()=>{setStatus('canceled')},
    className:''
  }]
  
  const orders = [
    {
      id: 'ORD20230615001',
      bookingDate: '2023-06-15T10:30:00',
      status: 'confirmed',
      paymentStatus: 'paid',
      totalPrice: 328,
      train: {
        trainNumber: 'G1234',
        departureStation: { name: '北京南' },
        arrivalStation: { name: '上海虹桥' },
        departureTime: '08:00',
        arrivalTime: '12:30',
        duration: '4小时30分'
      },
      passengers: [
        { name: '张三', idCard: '110101199001011234' },
        { name: '李四', idCard: '110101199002022345' }
      ],
      seats: [
        { carNumber: '05', seatNumber: '12A', price: 164 },
        { carNumber: '05', seatNumber: '12B', price: 164 }
      ]
    },
    {
      id: 'ORD20230618002',
      bookingDate: '2023-06-18T14:15:00',
      status: 'pending',
      paymentStatus: 'pending',
      totalPrice: 216,
      train: {
        trainNumber: 'D735',
        departureStation: { name: '广州南' },
        arrivalStation: { name: '深圳北' },
        departureTime: '09:30',
        arrivalTime: '10:15',
        duration: '45分钟'
      },
      passengers: [
        { name: '王五', idCard: '440301199003033456' }
      ],
      seats: [
        { carNumber: '03', seatNumber: '08C', price: 216 }
      ]
    },
    {
      id: 'ORD20230620003',
      bookingDate: '2023-06-20T16:45:00',
      status: 'cancelled',
      paymentStatus: 'failed',
      totalPrice: 189,
      train: {
        trainNumber: 'K256',
        departureStation: { name: '成都东' },
        arrivalStation: { name: '重庆北' },
        departureTime: '07:45',
        arrivalTime: '10:30',
        duration: '2小时45分'
      },
      passengers: [
        { name: '赵六', idCard: '510101199004044567' }
      ],
      seats: [
        { carNumber: '12', seatNumber: '22F', price: 189 }
      ]
    }
  ];


  const handleCancelOrder = (orderId) => {
    console.log('Cancel order:', orderId);
  };

  const handleRefundOrder = (orderId) => {
    console.log('Refund order:', orderId);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto min-w-[900px]">
      {/* 头部 */}
      <div className={`${isScrolled?`fixed top-0 left-0 right-0 z-50 translate-x-[6.5px] mx-auto `:``}  max-w-4xl min-w-[770px] bg-white rounded-lg shadow-sm p-6 mb-6`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">我的订单</h1>
        </div>

        {/* 搜索和筛选 */}
        <div className={`flex flex-col md:flex-row gap-4`}>
          <div className="flex-1 relative">
            <input
              ref={inpRef}
              type="text"
              placeholder="搜索订单号、车次或乘客姓名"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if(e.target.value!==''){
                  if(status !== 'search'){
                    setPrevStatus(status)
                  }
                  setStatus('search')
                }else{
                  setStatus(prevStatus)
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          {/* <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">全部状态</option>
            <option value="pending">待确认</option>
            <option value="confirmed">已确认</option>
            <option value="cancelled">已取消</option>
          </select> */}
        </div>
      </div>

      <div className={`${isScrolled?'mt-[170px]':''}`}></div>{/*更平滑 */}
      <div className='relative min-h-[100%] flex p-[20px] rounded-[10px] shadow-lg'>
        <div className={`${isScrolled?'fixed translate-y-[-67px]':''} flex-col mr-[50px]`}>
         {statusList.map(sl=> <OrdersStatuList 
          key={sl.sta}
          nowStatus={status}
          title={sl.title}
          onclick={sl.onclick}
          status={sl.sta}
          ></OrdersStatuList>
        )}
        </div>
        <div className={isScrolled?`w-[193.9px] m-[33px]`:'display-none'}></div>
        <div className='rounded w-[600px] bg-white p-[20px] shadow-lg'><OrdersList 
          orders={showOrders}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onCancelOrder={handleCancelOrder}
          onRefundOrder={handleRefundOrder}
          />
        </div>
      </div>

      {/* <OrdersList 
        orders={orders}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onCancelOrder={handleCancelOrder}
        onRefundOrder={handleRefundOrder}
      /> */}
    </div>
  );
};

export default OrdersPage;