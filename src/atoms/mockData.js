export const mockStations = [
  { id: '1', name: '北京南', code: 'BJS', city: '北京' },
  { id: '2', name: '上海虹桥', code: 'SHH', city: '上海' },
  { id: '3', name: '广州南', code: 'GZN', city: '广州' },
  { id: '4', name: '深圳北', code: 'SZB', city: '深圳' },
  { id: '5', name: '杭州东', code: 'HZD', city: '杭州' },
  { id: '6', name: '南京南', code: 'NJN', city: '南京' },
  { id: '7', name: '天津西', code: 'TJX', city: '天津' },
  { id: '8', name: '西安北', code: 'XAB', city: '西安' },
  { id: '9', name: '成都东', code: 'CDD', city: '成都' },
  { id: '10', name: '重庆北', code: 'CQB', city: '重庆' },
];

export const mockTrains = [
  {
    id: '1',
    trainNumber: 'G1',
    type: 'G',
    departureStation: mockStations[0],
    arrivalStation: mockStations[1],
    departureTime: '08:00',
    arrivalTime: '12:28',
    duration: '4小时28分',
    seats: [
      { type: 'businessClass', name: '商务座', price: 1748, available: 12 },
      { type: 'firstClass', name: '一等座', price: 933, available: 45 },
      { type: 'secondClass', name: '二等座', price: 553, available: 156 },
    ],
    price: {
      businessClass: 1748,
      firstClass: 933,
      secondClass: 553,
    },
    available: {
      businessClass: 12,
      firstClass: 45,
      secondClass: 156,
    },
  },
  {
    id: '2',
    trainNumber: 'G3',
    type: 'G',
    departureStation: mockStations[0],
    arrivalStation: mockStations[1],
    departureTime: '09:00',
    arrivalTime: '13:28',
    duration: '4小时28分',
    seats: [
      { type: 'businessClass', name: '商务座', price: 1748, available: 0 },
      { type: 'firstClass', name: '一等座', price: 933, available: 23 },
      { type: 'secondClass', name: '二等座', price: 553, available: 89 },
    ],
    price: {
      businessClass: 1748,
      firstClass: 933,
      secondClass: 553,
    },
    available: {
      businessClass: 8,
      firstClass: 23,
      secondClass: 89,
    },
  },
  {
    id: '3',
    trainNumber: 'G7',
    type: 'G',
    departureStation: mockStations[0],
    arrivalStation: mockStations[1],
    departureTime: '10:00',
    arrivalTime: '14:28',
    duration: '4小时28分',
    seats: [
      { type: 'businessClass', name: '商务座', price: 1748, available: 15 },
      { type: 'firstClass', name: '一等座', price: 933, available: 67 },
      { type: 'secondClass', name: '二等座', price: 553, available: 234 },
    ],
    price: {
      businessClass: 1748,
      firstClass: 933,
      secondClass: 553,
    },
    available: {
      businessClass: 15,
      firstClass: 67,
      secondClass: 234,
    },
  },
];

export const mockPassengers = [
  {
    id: '1',
    name: '张三',
    idNumber: '110101199001011234',
    phone: '13800138000',
    passengerType: 'adult',
  },
  {
    id: '2',
    name: '李四',
    idNumber: '110101199002021234',
    phone: '13800138001',
    passengerType: 'adult',
  },
];