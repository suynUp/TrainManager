import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  CreditCard, 
  Train, 
  Calendar,
  Phone,
  IdCard,
  Mail,
  Download,
  Printer,
  Share,
  ChevronRight,
  QrCode,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users
} from 'lucide-react';
import { get, post } from '../../utils/request';
import { toast, ToastContainer } from 'react-toastify';
import { useAtom } from 'jotai';
import { pageAtom, userIdAtom } from '../AtomExport';
import { useLocation } from 'wouter';

const OrderDetail = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [userId] = useAtom(userIdAtom);
  const [,setLocation] = useLocation()
  const [ , setCurrentPage] = useAtom(pageAtom)
  const [trigger,setTrigger] = useState(true)

  const formContainerRef = useRef(null);
  const [inner,setInner] = useState('<></>')

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const order = await get("/orderMessage/get", {
          orderId: searchParams.get('orderId'),
          userId
        });
        
        if (order.code === 200 && order.data && order.data.length > 0) {
          // 合并相同订单ID的数据
          const mergedData = mergeOrderData(order.data);
          setOrderData(mergedData);
        } else {
          toast.error("获取订单详情失败");
        }
      } catch (error) {
        console.error('获取订单详情错误:', error);
        toast.error("网络错误，请重试");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [userId,trigger]);

  useEffect(() => {
    if (inner && formContainerRef.current) {
          // 创建临时容器解析HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = inner;
          
          // 获取表单和脚本
          const form = tempDiv.querySelector('form');
          const script = tempDiv.querySelector('script');
          
          // 清空容器并添加表单
          formContainerRef.current.innerHTML = '';
          if (form) {
              // 关键修改：设置表单在新窗口打开
              form.setAttribute('target', '_blank');
              
              formContainerRef.current.appendChild(form);
              
              // 如果有自动提交脚本，执行它
              if (script) {
                  const newScript = document.createElement('script');
                  newScript.textContent = script.textContent;
                  document.body.appendChild(newScript);
              }
              
              // 自动提交表单
              form.submit();
          }
      }
  }, [inner]);

  // 合并相同订单ID的数据
  const mergeOrderData = (data) => {
    if (!data || data.length === 0) return null;
    
    // 使用第一个订单作为基础
    const baseOrder = data[0];
    const mergedData = {
      orders: baseOrder.orders,
      passengers: [baseOrder.passenger],
      seats: [baseOrder.seat],
      ouids: [baseOrder.ouid]
    };
    
    // 合并其他相同订单ID的数据
    for (let i = 1; i < data.length; i++) {
      if (data[i].orders.orderId === baseOrder.orders.orderId) {
        mergedData.passengers.push(data[i].passenger);
        mergedData.seats.push(data[i].seat);
        mergedData.ouids.push(data[i].ouid);
      }
    }
    
    return mergedData;
  };

  // 格式化状态显示
  const getStatusDisplay = (status) => {
    const statusMap = {
      'PENDING': { 
        text: '待支付', 
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle,
        description: '请在尽快完成支付'
      },
      'PAID': { 
        text: '已支付', 
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        description: '支付成功'
      },
      'COMPLETED': { 
        text: '已完成', 
        color: 'bg-blue-100 text-blue-800',
        icon: CheckCircle,
        description: '订单已完成'
      },
      'CANCELLED': { 
        text: '已取消', 
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        description: '订单已取消'
      },
    };
    return statusMap[status] || { 
      text: status, 
      color: 'bg-gray-100 text-gray-800',
      icon: AlertCircle,
      description: ''
    };
  };

  // 格式化座位类型显示
  const formatSeatClass = (seatClass) => {
    const classMap = {
      'BUSINESS': { text: '商务座', color: 'text-purple-600 bg-purple-100' },
      'FIRST': { text: '一等座', color: 'text-blue-600 bg-blue-100' },
      'SECOND': { text: '二等座', color: 'text-green-600 bg-green-100' }
    };
    return classMap[seatClass] || { text: seatClass, color: 'text-gray-600 bg-gray-100' };
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

  // 格式化日期时间
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '--';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化时间（仅时间部分）
  const formatTimeOnly = (dateTimeStr) => {
    if (!dateTimeStr) return '--:--';
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 操作处理函数
  const handlePayment = async () => {
    
    const searchParams = new URLSearchParams(window.location.search);
           
    const res = await get('/order/pay',{orderId:searchParams.get('orderId'),userId})
    console.log(res)
    if(res.code == 200){
      setInner(res.data)
      setTrigger(!trigger)
    }else{
      alert('失败啊')
      console.log(res)
      setIsProcessing(false)
    }

  };

  const handleCancel = async () => {
    if (window.confirm('确定要取消此订单吗？')) {
        const searchParams = new URLSearchParams(window.location.search);

        const res = await get('/order/cancel',{userId,orderId:searchParams.get('orderId')})
          if(res.code == 200){
            toast.success('成功了')
            setTrigger(!trigger)
          }else{
            toast.error("失败啊")
          }
                    
        toast.success('订单已取消');
    
    }
  };

  const handleRefund = async () => {
    if (window.confirm('确定要申请退票吗？')) {
      try {
        // 退票逻辑
        toast.success('退票申请已提交');
      } catch (error) {
        toast.error('退票申请失败');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载订单详情...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">订单不存在</h2>
          <p className="text-gray-600 mb-6">请检查订单号是否正确</p>
          <button
            onClick={() => setL}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  const order = orderData.orders || {};
  const passengers = orderData.passengers || [];
  const seats = orderData.seats || [];
  const statusInfo = getStatusDisplay(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ToastContainer position="top-right" autoClose={3000} />

              
         <div 
            ref={formContainerRef} 
          />
      
      {/* 头部 */}
      <div className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setCurrentPage(1)
                setLocation("/")}}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              返回订单列表
            </button>
            
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-full flex items-center ${statusInfo.color}`}>
                <StatusIcon className="h-4 w-4 mr-2" />
                <span className="font-medium">{statusInfo.text}</span>
              </div>
              
              <div className="flex space-x-2">
                <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                  <Printer className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50">
                  <Download className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50">
                  <Share className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 主要内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧信息 */}
          <div className="lg:col-span-2">
            {/* 订单概览 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">订单详情</h1>
                <span className="text-sm text-gray-500">订单号: #{order.orderId?.toString().padStart(8, '0') || '--'}</span>
              </div>

              {/* 状态提示 */}
              {statusInfo.description && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <StatusIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-blue-800">{statusInfo.description}</span>
                  </div>
                </div>
              )}

              {/* 车次信息卡片 */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 rounded-xl p-3">
                      <Train className="h-8 w-8" />
                    </div>
                    <div>
                      <span className="bg-white/20 px-4 py-2 rounded-xl text-sm font-bold">
                        {order.train?.trainNo || '--'}
                      </span>
                      <span className="ml-3 text-blue-100 text-sm">{order.train?.trainType}型列车</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-200 text-sm">出发日期</div>
                    <div className="font-semibold">
                      {order.startTime ? new Date(order.startTime).toLocaleDateString('zh-CN') : '--'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{formatTimeOnly(order.startTime)}</div>
                      <div className="text-blue-200 text-sm mt-2">{order.from?.stationName || '--'}</div>
                      <div className="text-blue-300 text-xs">{order.from?.city || '--'}</div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-20 h-px bg-white/50"></div>
                      <div className="mx-4 text-center">
                        <Clock className="h-6 w-6 mx-auto mb-1" />
                        <div className="text-sm">{order.duration || '--'}</div>
                      </div>
                      <div className="w-20 h-px bg-white/50"></div>
                    </div>

                    <div className="text-center">
                      <div className="text-3xl font-bold">{formatTimeOnly(order.arrivalTime)}</div>
                      <div className="text-blue-200 text-sm mt-2">{order.to?.stationName || '--'}</div>
                      <div className="text-blue-300 text-xs">{order.to?.city || '--'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 乘客数量提示 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-blue-800">本订单包含 {passengers.length} 位乘客</span>
              </div>

              {/* 详细信息选项卡 */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  {['details', 'passenger', 'payment'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab === 'details' && '行程详情'}
                      {tab === 'passenger' && `乘客信息 (${passengers.length})`}
                      {tab === 'payment' && '支付信息'}
                    </button>
                  ))}
                </nav>
              </div>

              {/* 选项卡内容 */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {passengers.map((passenger, index) => {
                    const seat = seats[index] || {};
                    const seatInfo = formatSeatClass(seat.seatClass);
                    
                    return (
                      <div key={index} className="bg-gray-50 rounded-xl p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <User className="h-5 w-5 mr-2 text-blue-600" />
                          乘客 {index + 1} 信息
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="text-md font-medium text-gray-900 mb-2">个人信息</h4>
                            <InfoItem label="姓名" value={passenger.name} />
                            <InfoItem label="类型" value={formatPassengerType(passenger.passengerType)} />
                            <InfoItem label="证件号" value={passenger.idCard} />
                            <InfoItem label="手机号" value={passenger.phoneNumber} />
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="text-md font-medium text-gray-900 mb-2">座位信息</h4>
                            <InfoItem label="车厢" value={seat.carriageNumber ? `${seat.carriageNumber}车` : '--'} />
                            <InfoItem label="座位号" value={seat.seatNumber} />
                            <InfoItem 
                              label="座位类型" 
                              value={
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${seatInfo.color}`}>
                                  {seatInfo.text}
                                </span>
                              } 
                            />
                            <InfoItem label="位置" value={seat.seatType === 'WINDOW' ? '靠窗' : seat.seatType === 'AISLE' ? '过道' : '--'} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'passenger' && (
                <div className="space-y-6">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="h-5 w-5 mr-2 text-blue-600" />
                        乘客 {index + 1} 详细信息
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <InfoItem label="姓名" value={passenger.name} />
                          <InfoItem label="乘客类型" value={formatPassengerType(passenger.passengerType)} />
                          <InfoItem label="证件类型" value="身份证" />
                          <InfoItem label="证件号码" value={passenger.idCard} />
                        </div>
                        <div className="space-y-3">
                          <InfoItem label="手机号码" value={passenger.phoneNumber} />
                          <InfoItem label="关联用户" value={passenger.user?.userName || '--'} />
                          <InfoItem label="审核状态" value={passenger.user?.passed ? '已通过' : '未通过'} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                    支付信息
                  </h3>
                  <div className="space-y-3">
                    <InfoItem label="票面总价" value={`¥${order.totalPrice || '0.00'}`} />
                    <InfoItem label="支付方式" value={order.paymentMethod || '未支付'} />
                    <InfoItem label="支付状态" value={statusInfo.text} />
                    {order.paymentTime && (
                      <InfoItem label="支付时间" value={formatDateTime(order.paymentTime)} />
                    )}
                    <InfoItem label="订单时间" value={formatDateTime(order.createTime)} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧操作面板 */}
          <div className="space-y-6">
            {/* 价格卡片 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">费用明细</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>票面价 ({passengers.length} 张)</span>
                  <span>¥{order.totalPrice || '0.00'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>服务费</span>
                  <span>¥0.00</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>实付金额</span>
                    <span className="text-orange-600">¥{order.totalPrice || '0.00'}</span>
                  </div>
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="space-y-3">
                {order.status === 'PENDING' && (
                  <>
                    <button
                      onClick={handlePayment}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold"
                    >
                      立即支付
                    </button>
                    <button
                      onClick={handleCancel}
                      className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      取消订单
                    </button>
                  </>
                )}
                {order.status === 'PAID' && (
                  <button
                    onClick={handleRefund}
                    className="w-full border border-red-300 text-red-600 py-3 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    申请退票
                  </button>
                )}
                <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <Phone className="h-4 w-4 mr-2" />
                  联系客服
                </button>
              </div>
            </div>

            {/* 安全提示 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">安全提示</h4>
                  <p className="text-xs text-yellow-700">
                    请勿向他人泄露您的订单信息和验证码，谨防诈骗
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 辅助组件：信息展示项
const InfoItem = ({ label, value }) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-gray-600">{label}:</span>
    <span className="font-medium text-gray-900">{value || '--'}</span>
  </div>
);

export default OrderDetail;