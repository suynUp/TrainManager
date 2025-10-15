import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, CreditCard, Smartphone, Building, CheckCircle2, Shield, Clock, Users, Calendar } from 'lucide-react';
import { useAtom } from 'jotai';
import { trainAtom, userIdAtom, orderAtom } from '../AtomExport';
import { useLocation } from 'wouter';
import { get } from '../../utils/request';

const PaymentPage = () => {
  const [route] = useAtom(trainAtom);
  const [order] = useAtom(orderAtom)
  const [userId] = useAtom(userIdAtom)
  const [train, setTrain] = useState({});

  const [,setLocation] = useLocation()
  const [allOrders, setAllOrders] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [passengers, setPassengers] = useState([]);
  const [seats, setSeats] = useState([]);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('alipay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [inner, setInner] = useState('')
  const [showPay, setShowPay] = useState(false) 

  const formContainerRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      setTrain(route?.from.train);
    }, 50)
  }, []);

  useEffect(() => {
    const getOrder = async () => {
      try {
        const res = await get('/orderMessage/get', { orderId: order.orderId, userId });
        console.log('订单数据:', res);
        
        if (res.code === 200 && res.data && res.data.length > 0) {
          setAllOrders(res.data);
          
          // 处理乘客数据
          const processedPassengers = res.data.map(item => ({
            name: item.passenger.name,
            idCard: item.passenger.idCard,
            passengerType: item.passenger.passengerType,
            phoneNumber: item.passenger.phoneNumber
          }));
          setPassengers(processedPassengers);
          
          // 处理座位数据，直接使用订单中的totalPrice
          const processedSeats = res.data.map(item => ({
            carNumber: item.seat.carriageNumber,
            seatNumber: item.seat.seatNumber,
            seatClass: item.seat.seatClass,
            seatType: item.seat.seatType,
            price: item.orders?.totalPrice || 0
          }));
          setSeats(processedSeats);
          
          // 计算总价 - 所有订单的totalPrice之和
          const calculatedTotal = res.data.reduce((sum, item) => sum + (item.orders?.totalPrice || 0), 0);
          setTotalPrice(calculatedTotal);
        }
      } catch (error) {
        console.error('获取订单错误:', error);
      }
    }
    getOrder()
  }, [order.orderId, userId])

  // 获取乘客类型中文显示
  const getPassengerTypeText = (type) => {
    const typeMap = {
      'ADULT': '成人',
      'STUDENT': '学生',
      'CHILD': '儿童'
    };
    return typeMap[type] || type;
  };

  // 获取座位等级中文显示
  const getSeatClassText = (seatClass) => {
    const classMap = {
      'FIRST': '一等座',
      'SECOND': '二等座',
      'BUSINESS': '商务座'
    };
    return classMap[seatClass] || seatClass;
  };

  // useEffect(() => {
  //   if (inner && formContainerRef.current) {
  //     const tempDiv = document.createElement('div');
  //     tempDiv.innerHTML = inner;
      
  //     const form = tempDiv.querySelector('form');
  //     const script = tempDiv.querySelector('script');
      
  //     formContainerRef.current.innerHTML = '';
      
  //     if (form) {
  //       // 创建iframe来提交表单
  //       const iframe = document.createElement('iframe');
  //       iframe.name = 'alipay_iframe';
  //       iframe.style.display = 'none';
  //       document.body.appendChild(iframe);
        
  //       form.setAttribute('target', 'alipay_iframe');
  //       formContainerRef.current.appendChild(form);
        
  //       // 执行脚本
  //       if (script) {
  //         const newScript = document.createElement('script');
  //         newScript.textContent = script.textContent;
  //         document.body.appendChild(newScript);
  //       }
        
  //       form.submit();
        
  //       // 监听iframe加载完成
  //       iframe.onload = function() {
  //         console.log('支付宝页面已加载');
  //       };
  //     }
  //   }
  // }, [inner]);

  const paymentMethods = [
    {
      id: 'alipay',
      name: '支付宝',
      icon: Smartphone,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: '推荐使用支付宝快捷支付',
      badge: '推荐'
    },
    {
      id: 'wechat',
      name: '微信支付',
      icon: Smartphone,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: '使用微信安全支付',
    },
    {
      id: 'unionpay',
      name: '银联支付',
      icon: CreditCard,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: '银联卡在线支付',
    },
    {
      id: 'bank',
      name: '网银支付',
      icon: Building,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: '各大银行网银支付',
    },
  ];

  const onBack = () => {
    console.log('返回上一页');
  };

  const calculateDuration = () => {
    if (allOrders.length === 0) return '';
    
    const firstOrder = allOrders[0];
    if (!firstOrder.orders?.startTime || !firstOrder.orders?.arrivalTime) return '';
    
    const departure = new Date(firstOrder.orders.startTime);
    const arrival = new Date(firstOrder.orders.arrivalTime);
    const diffMs = arrival.getTime() - departure.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}小时${diffMinutes}分钟`;
  };

 const handlePayment = async () => {
        setIsProcessing(true);
        try {
            const res = await get('/order/pay', { orderId: order.orderId, userId });
            console.log('支付响应:', res);
            
            if (res.code === 200) {
                // 直接在当前页面处理支付宝表单
                processAlipayForm(res.data);
            } else {
                alert('支付请求失败: ' + (res.message || '未知错误'));
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('支付错误:', error);
            alert('支付请求异常: ' + error.message);
            setIsProcessing(false);
        }
    };

    const processAlipayForm = (htmlString) => {
        // 创建临时div来解析HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        
        const form = tempDiv.querySelector('form');
        const script = tempDiv.querySelector('script');
        
        if (form) {
            // 设置表单在当前页面打开
            form.removeAttribute('target');
            
            // 添加到body并提交
            document.body.appendChild(form);
            
            // 执行脚本（如果有）
            if (script) {
                const newScript = document.createElement('script');
                newScript.textContent = script.textContent;
                document.body.appendChild(newScript);
            } else {
                // 如果没有自动提交脚本，手动提交
                form.submit();
            }
            
            console.log('正在跳转到支付宝...');
        } else {
            console.error('未找到支付表单');
            setIsProcessing(false);
        }
    };

  // 获取车次信息
  const getTrainInfo = () => {
    if (allOrders.length === 0) return {};
    const firstOrder = allOrders[0];
    return {
      trainNo: firstOrder.orders?.train?.trainNo || 'G101',
      fromStation: firstOrder.orders?.from?.stationName || '济南西站',
      toStation: firstOrder.orders?.to?.stationName || '广州南站',
      departureTime: firstOrder.orders?.startTime,
      arrivalTime: firstOrder.orders?.arrivalTime
    };
  };

  const trainInfo = getTrainInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        
          <div 
            ref={formContainerRef} 
            style={{ display: showPay ? 'visible' : 'none' }}
          />
          
          {/* 头部导航 */}
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={onBack}
                  className="flex items-center text-white/90 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  <span className="font-medium">返回乘客信息</span>
                </button>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">安全支付</span>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <h3 className="font-bold text-lg mb-3 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  订单信息
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-white/70">车次</div>
                    <div className="font-bold text-lg">{trainInfo.trainNo}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-white/70">日期</div>
                    <div className="font-semibold">
                      {trainInfo.departureTime ? new Date(trainInfo.departureTime).toLocaleDateString() : new Date().toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-white/70 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      时长
                    </div>
                    <div className="font-semibold">{calculateDuration()}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-white/70 flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      乘客
                    </div>
                    <div className="font-semibold">{passengers.length} 人</div>
                  </div>
                </div>
                <div className="mt-3 text-sm">
                  <div className="text-white/70">
                    {trainInfo.fromStation} → {trainInfo.toStation}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            
            {/* 订单详情 */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
                订单详情
              </h3>
              <div className="space-y-3">
                {passengers.map((passenger, index) => (
                  <div 
                    key={index} 
                    className="group bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="font-bold text-gray-900 text-lg">{passenger.name}</div>
                        <div className="text-gray-600 flex items-center space-x-2">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                            {seats[index]?.carNumber}车 {seats[index]?.seatNumber}
                            {seats[index]?.seatClass && ` · ${getSeatClassText(seats[index].seatClass)}`}
                          </span>
                          <span className="text-sm">
                            {getPassengerTypeText(passenger.passengerType)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          身份证: {passenger.idCard}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          ¥{seats[index]?.price || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 支付方式 */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
                选择支付方式
              </h3>
              <div className="grid gap-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`relative group cursor-pointer transition-all duration-300 ${
                      selectedPaymentMethod === method.id
                        ? 'scale-[1.02] shadow-lg'
                        : 'hover:scale-[1.01] hover:shadow-md'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedPaymentMethod === method.id
                        ? `${method.borderColor} ${method.bgColor} shadow-lg`
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${method.color} mr-4 transform group-hover:scale-110 transition-transform duration-200`}>
                          <method.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900">{method.name}</span>
                            {method.badge && (
                              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {method.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{method.description}</div>
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <div className="absolute top-2 right-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-200">
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 价格汇总 */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">价格明细</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-gray-600">
                  <span>票价小计</span>
                  <span className="font-semibold">¥{totalPrice}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>手续费</span>
                  <span className="font-semibold text-green-600">免费</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>保险费</span>
                  <span className="font-semibold text-green-600">免费</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">总计</span>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                        ¥{totalPrice}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 支付按钮 */}
            <div className="space-y-4">
              <button
                onClick={handlePayment}
                disabled={isProcessing || passengers.length === 0}
                className={`relative w-full py-4 px-6 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 ${
                  isProcessing || passengers.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative z-10">
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mr-3"></div>
                      <span>正在跳转支付...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Shield className="h-6 w-6 mr-3" />
                      <span>立即支付 ¥{totalPrice}</span>
                    </div>
                  )}
                </div>
              </button>
              <button 
                onClick={() => setLocation('/')}
                className='text-white relative w-full py-4 px-6 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 border-[2px] border-blue-500'
              >
                返回个人中心
              </button>
              <div className="text-center">
                <p className="text-xs text-gray-500 flex items-center justify-center">
                  <Shield className="h-3 w-3 mr-1" />
                  点击支付即表示您同意相关服务条款和隐私政策
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 成功提示 */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-auto text-center transform animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">支付成功！</h3>
            <p className="text-gray-600">正在为您准备订单详情...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;