import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, User, ChevronDown, ChevronUp ,Plus} from 'lucide-react';
import { useAtom } from 'jotai';
import { trainAtom ,seatTypeAtom, priceAtom, passengersAtom,seatsAtom, userIdAtom } from '../AtomExport';
import { useLocation } from 'wouter';
import { get } from '../../utils/request';

const SeatSelection = () => {
  const [, setLocation] = useLocation();

  const [train] = useAtom(trainAtom);
  const [seatType, setSeatType] = useAtom(seatTypeAtom);
  const [,setPrice] = useAtom(priceAtom)
  const [,setSelectedPassengers] = useAtom(passengersAtom)
  const [,setSeats] = useAtom(seatsAtom)

  const [userId] = useAtom(userIdAtom)

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([
    { passengerId: 1, name: '乘客1', type: '成人', selected: false },
    { passengerId: 2, name: '乘客2', type: '成人', selected: false }
  ]);
  const [showPassengerList, setShowPassengerList] = useState(false);

  // 初始化时检查是否有车次数据
  useEffect(() => {
    console.log(train)
    if (!train) {
      setLocation('/');
    }
  }, [train, setLocation]);

  useEffect(()=>{

    getPassenger()

  },[userId])

  const getPassenger = async () => {//处理获得的data
    /*
    idCard:"532925200502100019"
    name: "苏煜楠"
    passengerId: 1
    passengerType:"STUDENT"
    phoneNumber: "18313160895" */
    const response = await get("/passenger/get",{userId})
    if(response.code === 200){
      console.log(response.data)
      setPassengers(response.data.map(p=>{return {...p,passengerType:typeConverter(p.passengerType),selected:false}}))
    }else{
      alert('失败')
    }
  }

  const typeConverter = (type) => {
    const map = { 成人: 'ADULT', 儿童: 'CHILD', 学生: 'STUDENT' };
    return map[type] || { ADULT: '成人', CHILD: '儿童', STUDENT: '学生' }[type] || type;
  };

  const managePassenger = () => {
    setLocation('/Passenger')
  } 

  // 生成模拟座位数据
  const generateSeats = (seatType) => {
    if (!train) return [];
    
    const seats = [];
    const carCount = {
      businessClass: 1,
      firstClass: 2,
      secondClass: 8,
      hardSleeper: 6,
      softSleeper: 4
    }[seatType] || 8;
    
    const seatsPerCar = {
      businessClass: 20,
      firstClass: 60,
      secondClass: 80,
      hardSleeper: 66,  // 硬卧每车厢11个隔间，每个隔间6个铺位
      softSleeper: 36   // 软卧每车厢9个隔间，每个隔间4个铺位
    }[seatType] || 80;

    const seatPrice = train.price[seatType] || 0;
    
    for (let car = 1; car <= carCount; car++) {
      for (let i = 1; i <= seatsPerCar; i++) {
        let seatNumber;
        if (seatType.includes('Sleeper')) {
          // 卧铺编号逻辑
          const compartment = Math.ceil(i / (seatType === 'hardSleeper' ? 6 : 4));
          const berth = (i - 1) % (seatType === 'hardSleeper' ? 6 : 4) + 1;
          const berthType = ['上', '中', '下', '上', '中', '下'][berth - 1];
          seatNumber = `${car}车${compartment}室${berthType}铺`;
        } else {
          // 座位编号逻辑
          const seatLetter = ['A', 'B', 'C', 'D', 'F'][i % 5];
          seatNumber = `${car}车${i}${seatLetter}`;
        }
        
        seats.push({
          id: `${car}-${i}`,
          carNumber: car,
          seatNumber,
          type: seatType,
          isOccupied: Math.random() < 0.3,
          price: seatPrice,
        });
      }
    }
    
    return seats;
  };

  const seats = generateSeats(seatType);

  const handleSeatClick = (seat) => {
    if (seat.isOccupied) return;

    const isSelected = selectedSeats.some(s => s.id === seat.id);
    
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else if (selectedSeats.length < passengers.filter(p => p.selected).length) {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const togglePassengerSelection = (id) => {
    setPassengers(passengers.map(p => 
      p.passengerId === id ? { ...p, selected: !p.selected } : p
    ));
  };

  const onConfirm = () => {
    if (selectedSeats.length !== passengers.filter(p => p.selected).length) {
      alert('请为每位乘客选择座位');
      return;
    }
    setPrice(selectedSeats.reduce((sum, seat) => sum + seat.price, 0))
    // 这里处理确认逻辑，如跳转到支付页面
    setSelectedPassengers(passengers.filter(p=>p.selected))
    console.log('选座完成', { passengers, seats: selectedSeats });
    setLocation('/PaymentPage')
  };

  const onBack = () => {
    setLocation('/TrainList');
  };

  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.carNumber]) {
      acc[seat.carNumber] = [];
    }
    acc[seat.carNumber].push(seat);
    return acc;
  }, {});

  const getSeatTypeDisplay = (type) => {
    const typeMap = {
      'businessClass': '商务座',
      'firstClass': '一等座',
      'secondClass': '二等座',
      'hardSleeper': '硬卧',
      'softSleeper': '软卧',
    };
    return typeMap[type] || type;
  };

  const selectedPassengerCount = passengers.filter(p => p.selected).length;

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl m-auto">
      {/* 头部信息 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            返回车次选择
          </button>
          <div className="text-sm text-gray-600">
            已选择 {selectedSeats.length} / {selectedPassengerCount} 个座位
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">
                {train?.trainNumber} · {getSeatTypeDisplay(seatType)}
              </div>
              <div className="text-sm text-gray-600">
                {train?.departureStation?.name} → {train?.arrivalStation?.name}
              </div>
              <div className="text-sm text-gray-600">
                {train?.departureTime} - {train?.arrivalTime}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-orange-600">
                ¥{train?.price[seatType]}
              </div>
              <div className="text-sm text-gray-600">每张</div>
            </div>
          </div>
        </div>
      </div>

      {/* 乘客选择 */}
      <div className="transition-all duration-500 p-4 border-b border-gray-200">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowPassengerList(!showPassengerList)}
        >
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2 text-gray-600" />
            <span className="font-medium">选择乘客 ({selectedPassengerCount})</span>
          </div>
          {showPassengerList ? <ChevronUp /> : <ChevronDown />}
        </div>
        
        {(<div id='show' className={`flex flex-col 
                                    ${showPassengerList?'mt-3 max-h-[500px]':'h-[0px]'}
                                    overflow-auto space-y-2 transition-all duration-500`}>
            {passengers.map(passenger => (
              <div 
                key={passenger.passengerId}
                className={`transition-all duration-500 p-3 rounded border ${passenger.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={() => togglePassengerSelection(passenger.passengerId)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={passenger.selected}
                    onChange={() => {}}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">{passenger.name}</div>
                    <div className="text-sm text-gray-600">{passenger.type}</div>
                  </div>
                </div>
              </div>
            ))}
            <div
                className={`transition-all duration-500 p-3 rounded border border-blue-500 bg-blue-50 cursor-pointer`}
                onClick={() => managePassenger()}
              >
                <div className="flex">
                  <div className='flex items-center justify-center h-full w-full'>
                    <Plus />
                  </div>
                </div>
              </div>
          </div>
        )}
      </div>

      {/* 座位类型选择 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {Object.keys(train?.price || {}).map(type => (
            <button
              key={type}
              onClick={() => setSeatType(type)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                seatType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {getSeatTypeDisplay(type)} ¥{train?.price[type]}
            </button>
          ))}
        </div>
      </div>

      {/* 座位图 */}
      <div className="p-6 max-h-96 overflow-y-auto">
        {seatType.includes('Sleeper') ? (
          // 卧铺显示方式
          <div className="space-y-6">
            {Object.entries(groupedSeats).map(([carNumber, carSeats]) => (
              <div key={carNumber} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 text-center">
                  {carNumber} 车厢
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {Array.from(new Set(carSeats.map(s => s.seatNumber.split('室')[0]))).map(compartment => (
                    <div key={compartment} className="border rounded p-3">
                      <div className="font-medium mb-2">{compartment}室</div>
                      <div className="space-y-2">
                        {carSeats
                          .filter(s => s.seatNumber.startsWith(compartment))
                          .map(seat => {
                            const isSelected = selectedSeats.some(s => s.id === seat.id);
                            return (
                              <button
                                key={seat.id}
                                onClick={() => handleSeatClick(seat)}
                                disabled={seat.isOccupied}
                                className={`w-full p-2 rounded text-sm font-medium transition-colors ${
                                  seat.isOccupied
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-green-500 text-white hover:bg-green-600'
                                }`}
                              >
                                {seat.seatNumber.split('室')[1]}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 座位显示方式
          <div className="space-y-6">
            {Object.entries(groupedSeats).map(([carNumber, carSeats]) => (
              <div key={carNumber} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 text-center">
                  {carNumber} 车厢
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {carSeats.slice(0, 60).map((seat) => {
                    const isSelected = selectedSeats.some(s => s.id === seat.id);
                    return (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.isOccupied}
                        className={`w-10 h-10 rounded text-xs font-medium transition-colors ${
                          seat.isOccupied
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-500 text-white'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {seat.seatNumber.split('车')[1]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部确认按钮 */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-orange-600">
            总价: ¥{selectedSeats.reduce((sum, seat) => sum + seat.price, 0)}
          </div>
          <button
            onClick={onConfirm}
            disabled={selectedSeats.length !== selectedPassengerCount || selectedPassengerCount === 0}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              (selectedSeats.length === selectedPassengerCount && selectedPassengerCount !== 0) 
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              确认选座
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;