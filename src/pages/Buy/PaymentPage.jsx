import React, { useEffect, useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, Building, CheckCircle2 } from 'lucide-react';
import { useAtom } from 'jotai';
import { passengersAtom, priceAtom, seatsAtom, trainAtom } from '../AtomExport';
import { useLocation } from 'wouter';

const PaymentPage = ({
}) => {
  const [,setLocation] = useLocation()

  const [train,] = useAtom(trainAtom)
  const [totalPrice] = useAtom(priceAtom)
  const [passengers] = useAtom(passengersAtom)
  const [seats] = useAtom(seatsAtom)

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('alipay');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(()=>{
    console.log('passengers',passengers)
    console.log('seats',seats)
  },[])

  const paymentMethods = [
    {
      id: 'alipay',
      name: '支付宝',
      icon: Smartphone,
      color: 'text-blue-600',
      description: '推荐使用支付宝快捷支付',
    },
    {
      id: 'wechat',
      name: '微信支付',
      icon: Smartphone,
      color: 'text-green-600',
      description: '使用微信安全支付',
    },
    {
      id: 'unionpay',
      name: '银联支付',
      icon: CreditCard,
      color: 'text-red-600',
      description: '银联卡在线支付',
    },
    {
      id: 'bank',
      name: '网银支付',
      icon: Building,
      color: 'text-purple-600',
      description: '各大银行网银支付',
    },
  ];

  const onBack = () => {
    useLocation('/SeatSelection')
  }

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // 模拟支付处理
    setTimeout(() => {
      setIsProcessing(false);
      const bookingId = `BK${Date.now()}`;
      onPaymentSuccess(bookingId);
    }, 3000);
  };

  const onPaymentSuccess = (bookingId) =>{
    setLocation('/BookingSuccess')
  }

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
            返回乘客信息
          </button>
          <div className="text-sm text-gray-600">
            支付订单
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">订单信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">车次:</span>
              <span className="font-medium">{train.trainNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">日期:</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">时间:</span>
              <span className="font-medium">{train.departureTime} - {train.arrivalTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">乘客:</span>
              <span className="font-medium">{passengers.length} 人</span>
            </div>
          </div>
        </div>
      </div>

      {/* 订单详情 */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">订单详情</h3>
        <div className="space-y-3">
          {passengers.map((passenger, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{passenger.name}</div>
                <div className="text-sm text-gray-600">
                  {seats[index].carNumber}车 {seats[index].seatNumber} · {passenger.passengerType === 'adult' ? '成人' : passenger.passengerType === 'child' ? '儿童' : '学生'}
                </div>
              </div>
              <div className="font-medium text-gray-900">
                ¥{seats[index].price}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 支付方式 */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">选择支付方式</h3>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedPaymentMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedPaymentMethod === method.id}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <method.icon className={`h-6 w-6 mr-3 ${method.color}`} />
              <div>
                <div className="font-medium text-gray-900">{method.name}</div>
                <div className="text-sm text-gray-600">{method.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 价格汇总 */}
      <div className="p-6 border-b border-gray-200">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">票价小计:</span>
            <span>¥{totalPrice}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">手续费:</span>
            <span>¥0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">保险费:</span>
            <span>¥0</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between text-lg font-semibold">
              <span>总计:</span>
              <span className="text-orange-600">¥{totalPrice}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 支付按钮 */}
      <div className="p-6">
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${
            isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              正在支付...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              立即支付 ¥{totalPrice}
            </div>
          )}
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-2">
          点击支付即表示您同意相关服务条款和隐私政策
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;