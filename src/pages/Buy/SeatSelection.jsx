import { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Train, 
  MapPin, 
  Clock,
  Users
} from 'lucide-react';
import { useAtom } from 'jotai';
import { trainAtom, seatTypeAtom, priceAtom, passengersAtom, seatsAtom, userIdAtom, dateAtom, orderAtom } from '../AtomExport';
import { useLocation } from 'wouter';
import { get, post } from '../../utils/request';

const SeatSelection = () => {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [,setOrder] = useAtom(orderAtom)

  const [train] = useAtom(trainAtom);
  const [seatType, setSeatType] = useAtom(seatTypeAtom);
  const [, setPrice] = useAtom(priceAtom);
  const [, setSelectedPassengers] = useAtom(passengersAtom);
  const [, setSeats] = useAtom(seatsAtom);
  const [userId] = useAtom(userIdAtom);
  const [selectedDate] = useAtom(dateAtom);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [showPassengerList, setShowPassengerList] = useState(false);
  const [seatPreference, setSeatPreference] = useState('AUTO');

  // 初始化时检查是否有车次数据
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!train) {
        setLocation('/');
      }
    }, 100);
    console.log(train)
    return () => clearTimeout(timer);
  }, [train, setLocation]);

  useEffect(() => {
    getPassenger();
  }, [userId]);

  const getPassenger = async () => {
    try {
      const response = await get("/passenger/get", { userId });
      if (response.code === 200) {
        setPassengers(response.data.map(p => ({
          ...p,
          passengerType: typeConverter(p.passengerType),
          selected: false
        })));
      }
    } catch (error) {
      console.error('获取乘客信息失败:', error);
    }
  };

  const typeConverter = (type) => {
    const map = { 成人: 'ADULT', 儿童: 'CHILD', 学生: 'STUDENT' };
    return map[type] || { ADULT: '成人', CHILD: '儿童', STUDENT: '学生' }[type] || type;
  };

  const managePassenger = () => {
    setLocation('/Passenger');
  };

  // 座位偏好选项
  const seatPreferenceOptions = [
    { value: 'AUTO', label: '系统分配', icon: '🎯' },
    { value: 'WINDOW', label: '靠窗', icon: '🪟' },
    { value: 'AISLE', label: '靠过道', icon: '🚶' }
  ];

  // 生成模拟座位数据
  const generateExampleRow = (seatType) => {
    const seatConfig = {
      businessClass: { seatLetters: ['A',"过道", 'F'] },
      firstClass: { seatLetters: ['A', 'C',"过道", 'D', 'F'] },
      secondClass: { seatLetters: ['A', 'B', 'C',"过道", 'D', 'F'] }
    };

    const config = seatConfig[seatType] || seatConfig.secondClass;
    const row = 5;
    
    return config.seatLetters.map((letter, index) => {
      const seatNumber = `${row}${letter}`;
      const isAisle = letter === "过道";
      
      return {
        id: `${row}-${letter}-${index}`,
        seatNumber,
        row,
        letter,
        type: seatType,
        price: getSeatPrice(seatType),
        isAisle,
        isWindow: letter === 'A' || letter === 'F',
        isFront: row <= 10,
        isBack: row > 10
      };
    });
  };

  const getSeatPrice = (seatType) => {
    if (!train) return 0;
    return {
      secondClass: train.secondticketPrice,
      firstClass: train.firstticketPrice,
      businessClass: train.businessticketPrice
    }[seatType] || 0;
  };

  const getAvailableSeatTypes = () => {
    if (!train) return [];
    
    return [
      { type: 'secondClass', name: '二等座', price: train.secondticketPrice, available: train.secondavailable },
      { type: 'firstClass', name: '一等座', price: train.firstticketPrice, available: train.firstavailable },
      { type: 'businessClass', name: '商务座', price: train.businessticketPrice, available: train.businessavailable }
    ].filter(type => type.available > 0);
  };

  const exampleRow = generateExampleRow(seatType);
  const availableSeatTypes = getAvailableSeatTypes();

  // 根据偏好自动选择座位
  const autoSelectSeats = () => {
    const selectedPassengers = passengers.filter(p => p.selected);
    if (selectedPassengers.length === 0) {
      setSelectedSeats([]);
      return;
    }

    // 根据偏好筛选可用座位
    let availableSeats = exampleRow.filter(seat => !seat.isAisle);
    
    if (seatPreference !== 'AUTO') {
      availableSeats = availableSeats.filter(seat => {
        switch (seatPreference) {
          case 'WINDOW': return seat.isWindow;
          case 'AISLE': return !seat.isWindow;
          default: return true;
        }
      });
    }

    // 选择前N个可用座位
    const newSelectedSeats = availableSeats.slice(0, selectedPassengers.length);
    setSelectedSeats(newSelectedSeats);
  };

  useEffect(() => {
    autoSelectSeats();
  }, [seatPreference, seatType, passengers]);

  const togglePassengerSelection = (id) => {
    setPassengers(passengers.map(p => 
      p.passengerId === id ? { ...p, selected: !p.selected } : p
    ));
  };

  const onConfirm = async () => {
    const selectedPassengers = passengers.filter(p => p.selected);
    if (selectedPassengers.length === 0) {
      alert('请至少选择一位乘客');
      return;
    }

    setPrice(selectedSeats.reduce((sum, seat) => sum + seat.price, 0));
    setSelectedPassengers(selectedPassengers);
    setSeats(selectedSeats);

    await createOrder();
  };

  const createOrder = async () => {
    const selectedPassengers = passengers.filter(p => p.selected);
    
    const body = {
      passengersId: selectedPassengers.map(p => p.passengerId),
      routes: [train.from, train.to],
      seatClass: convertClass(seatType),
      selectedFlag: seatPreference==='AUTO'?'TABLE':seatPreference,
      time: formatToYYYYMMDD(selectedDate)
    };
    
    const params = {
      userId,
      trainId: train.from.train.trainId,
      fromId: train.from.station.stationId,
      toId: train.to.station.stationId
    };

    try {
      const res = await post("/order/create", body, params);
      if (res.code === 200) {
        setOrder(res.data)
        setLocation('/PaymentPage');
      } else {
        alert('创建订单失败: ' + res.message);
      }
    } catch (error) {
      console.error('创建订单失败:', error);
      alert('创建订单失败，请重试');
    }
  };

  const formatToYYYYMMDD = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const convertClass = (text) => {
    const classMap = {
      secondclass: 'SECOND',
      firstclass: 'FIRST',
      businessclass: 'BUSINESS'
    };
    return classMap[text.toLowerCase()] || text;
  };

  const onBack = () => {
    setLocation('/TrainList');
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleDateString('zh-CN', { 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const calculateDuration = () => {
    if (!train?.from?.departureTime || !train?.to?.arrivalTime) return '';
    const departure = new Date(train.from.departureTime);
    const arrival = new Date(train.to.arrivalTime);
    const diffMs = arrival.getTime() - departure.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}小时${diffMinutes}分钟`;
  };

  const selectedPassengerCount = passengers.filter(p => p.selected).length;

  if (!train) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* 头部信息 */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={onBack} className="flex items-center text-white/90 hover:text-white transition-all">
                <ArrowLeft className="h-5 w-5 mr-2" />
                返回车次选择
              </button>
              <div className="flex items-center text-white/90">
                <Users className="h-4 w-4 mr-2" />
                已选择 {selectedSeats.length} / {selectedPassengerCount} 个座位
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 rounded-full p-2">
                    <Train className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl font-bold">{train.from.train.trainNo}</span>
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {train.from.train.trainType}型
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-white/90">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{train.from.station.stationName}</span>
                        <span className="text-white/70">→</span>
                        <span>{train.to.station.stationName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(train.from.departureTime)} - {formatTime(train.to.arrivalTime)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/70 mb-1">{formatDate(train.from.departureTime)}</div>
                  <div className="text-sm font-medium text-white/90">历时 {calculateDuration()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 乘客选择 */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between cursor-pointer group" onClick={() => setShowPassengerList(!showPassengerList)}>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2 group-hover:bg-blue-200 transition-colors">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <span className="font-semibold text-gray-900">选择乘客</span>
                  <div className="text-sm text-gray-500">已选择 {selectedPassengerCount} 位乘客</div>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${showPassengerList ? 'rotate-180' : ''}`} />
            </div>
            
            <div className={`overflow-hidden transition-all ${showPassengerList ? 'max-h-96 mt-4' : 'max-h-0'}`}>
              <div className="space-y-3">
                {passengers.map((passenger) => (
                  <div key={passenger.passengerId} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    passenger.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`} onClick={() => togglePassengerSelection(passenger.passengerId)}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        passenger.selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {passenger.selected && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{passenger.name}</div>
                        <div className="text-sm text-gray-600">{passenger.type}</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="p-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 cursor-pointer hover:border-blue-400 transition-all" onClick={managePassenger}>
                  <div className="flex items-center justify-center space-x-3 text-blue-600">
                    <Plus className="h-5 w-5" />
                    <span className="font-medium">添加或管理乘客</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 座位类型和偏好选择 */}
          <div className="p-6 border-b border-gray-100">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">选择座位类型和偏好</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 座位类型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">座位类型</label>
                <div className="flex space-x-2 overflow-x-auto">
                  {availableSeatTypes.map((type) => (
                    <button
                      key={type.type}
                      onClick={() => setSeatType(type.type)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                        seatType === type.type
                          ? 'bg-blue-600 text-white border-transparent shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 座位偏好选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">座位偏好</label>
                <div className="flex space-x-2 overflow-x-auto">
                  {seatPreferenceOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSeatPreference(option.value)}
                      className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                        seatPreference === option.value
                          ? 'bg-green-600 text-white border-transparent shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <span className="mr-1">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 座位示例和自动分配提示 */}
          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-yellow-600 text-lg mr-2">💺</div>
                <div>
                  <h4 className="font-semibold text-yellow-800">系统自动分配座位</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    根据您选择的座位偏好，系统将自动为您分配最佳座位。
                    下方显示的是该车厢的座位布局示例，您无法手动选择座位。
                  </p>
                </div>
              </div>
            </div>

            {/* 座位示例图 */}
            <div className="bg-gray-100 rounded-xl p-6 mb-6">
              <div className="text-center mb-4">
                <h4 className="font-semibold text-gray-900">车厢座位布局示例</h4>
                <p className="text-sm text-gray-600">第5排座位展示</p>
              </div>
              
              <div className="flex justify-center space-x-8 items-center">
                <div className="flex items-center space-x-4">
                  {exampleRow.map((seat) => (
                    seat.isAisle ? (
                      <div key={seat.id} className="text-center">
                        <div className="w-12 h-8 bg-gray-300 rounded mb-2"></div>
                        <span className="text-xs text-gray-600">过道</span>
                      </div>
                    ) : (
                      <div key={seat.id} className="text-center">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold mb-1 ${
                          selectedSeats.some(s => s.id === seat.id)
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-gray-400 text-white cursor-not-allowed'
                        }`}>
                          {seat.seatNumber}
                        </div>
                        <div className="text-xs text-gray-600">
                          {seat.isWindow ? '靠窗' : '过道'}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* 座位图例 */}
              <div className="flex justify-center space-x-6 mt-6 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                  <span>不可选座位</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>已分配座位</span>
                </div>
              </div>
            </div>

            {/* 当前选择信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">当前选择</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">座位类型：</span>
                  <span className="font-medium">{availableSeatTypes.find(t => t.type === seatType)?.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">座位偏好：</span>
                  <span className="font-medium">{seatPreferenceOptions.find(o => o.value === seatPreference)?.label}</span>
                </div>
                <div>
                  <span className="text-gray-600">预估价格：</span>
                  <span className="font-medium text-orange-600">
                    ¥{selectedSeats.reduce((sum, seat) => sum + seat.price, 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">分配座位：</span>
                  <span className="font-medium">
                    {selectedSeats.length > 0 
                      ? selectedSeats.map(s => s.seatNumber).join(', ')
                      : '等待分配'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                总价: ¥{selectedSeats.reduce((sum, seat) => sum + seat.price, 0)}
              </div>
              
              <button
                onClick={onConfirm}
                disabled={selectedPassengerCount === 0}
                className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                  selectedPassengerCount !== 0
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>确认选座</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;