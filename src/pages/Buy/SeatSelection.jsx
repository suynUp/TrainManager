import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { mockTrains } from '../../atoms/mockData';

const SeatSelection = ({
  seatType,
}) => {

  var passengerCount = 2
  train = mockTrains[1]
  const [selectedSeats, setSelectedSeats] = useState([]);

  const onConfirm = (seats) => {

  }

  const onBack = () => {
    
  }

  // 生成模拟座位数据
  const generateSeats = (seatType) => {
    const seats = [];
    const carCount = seatType === 'businessClass' ? 1 : seatType === 'firstClass' ? 2 : 8;
    
    for (let car = 1; car <= carCount; car++) {
      const seatsPerCar = seatType === 'businessClass' ? 20 : seatType === 'firstClass' ? 60 : 80;
      const seatPrice = train.price[seatType] || 0;
      
      for (let i = 1; i <= seatsPerCar; i++) {
        const seatNumber = `${i}${['A', 'B', 'C', 'D', 'F'][i % 5]}`;
        seats.push({
          id: `${car}-${seatNumber}`,
          carNumber: car,
          seatNumber,
          type: seatType,
          isOccupied: Math.random() < 0.3, // 30% 的座位被占用
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
    } else if (selectedSeats.length < passengerCount) {
      setSelectedSeats([...selectedSeats, seat]);
    }
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

  return (
    <div className="bg-white rounded-lg shadow-lg">
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
            已选择 {selectedSeats.length} / {passengerCount} 个座位
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">
                {train.trainNumber} · {getSeatTypeDisplay(seatType)}
              </div>
              <div className="text-sm text-gray-600">
                {train.departureStation.name} → {train.arrivalStation.name}
              </div>
              <div className="text-sm text-gray-600">
                {train.departureTime} - {train.arrivalTime}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-orange-600">
                ¥{train.price[seatType]}
              </div>
              <div className="text-sm text-gray-600">每张</div>
            </div>
          </div>
        </div>
      </div>

      {/* 座位图例 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span>可选</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span>已选</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
            <span>已占</span>
          </div>
        </div>
      </div>

      {/* 座位图 */}
      <div className="p-6 max-h-96 overflow-y-auto">
        <div className="space-y-6">
          {Object.entries(groupedSeats).map(([carNumber, carSeats]) => (
            <div key={carNumber} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">
                {carNumber} 车厢
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {carSeats.slice(0, 20).map((seat) => {
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
                      {seat.seatNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部确认按钮 */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            总价: ¥{selectedSeats.reduce((sum, seat) => sum + seat.price, 0)}
          </div>
          <button
            onClick={() => onConfirm(selectedSeats)}
            disabled={selectedSeats.length !== passengerCount}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              selectedSeats.length === passengerCount
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