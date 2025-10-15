import { useEffect, useState } from 'react';
import { Train, Users, ChevronLeft, ChevronRight, Plus, Minus, Edit2, Save, X, Search } from 'lucide-react';
import { get, post } from '../utils/request';
import { useAtom } from 'jotai';
import { userIdAtom } from '../atoms/userAtoms';
import { toast } from 'react-toastify';

// 美观的列车选择组件
function TrainSelector({ trains, selectedTrain, onSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredTrains = trains.filter(train => 
    train.trainNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    train.trainType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTrainTypeColor = (type) => {
    switch (type) {
      case 'G': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'D': return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case 'C': return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getTrainTypeName = (type) => {
    switch (type) {
      case 'G': return '高速动车组';
      case 'D': return '动车组';
      case 'C': return '城际动车组';
      default: return '普通列车';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">选择列车</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="搜索列车号或类型..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTrains.map((train) => (
              <div
                key={train.trainId}
                onClick={() => onSelect(train)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedTrain?.trainId === train.trainId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTrainTypeColor(train.trainType)}`}>
                    {train.trainType}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-900">{train.trainNo}</div>
                    <div className="text-sm text-gray-600">{getTrainTypeName(train.trainType)}</div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${train.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredTrains.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Train className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>未找到匹配的列车</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SeatManagement() {
  const [userId] = useAtom(userIdAtom);
  const [seatData, setSeatData] = useState([]);
  const [trainData, setTrainData] = useState([]);
  const [availableTrains, setAvailableTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 模态框状态
  const [showAddSeatModal, setShowAddSeatModal] = useState(false);
  const [showTrainSelector, setShowTrainSelector] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  
  // 编辑状态
  const [editingCarriage, setEditingCarriage] = useState(null);
  const [editingSeatCounts, setEditingSeatCounts] = useState({FIRST: 0, SECOND: 0, BUSINESS: 0});

  // 添加座位表单状态
  const [newSeatData, setNewSeatData] = useState({
    carriageNumber: "",
    firNumber: 0,
    secNumber: 0,
    busNumber: 0,
    sleNumber:0
  });

  // 座位类型配置
  const seatClassConfig = {
    BUSINESS: { name: '商务座', color: 'bg-orange-100 text-orange-800', icon: '🥇', bgColor: 'bg-orange-50', seatsPerRow: 2 },
    FIRST: { name: '一等座', color: 'bg-blue-100 text-blue-800', icon: '🥈', bgColor: 'bg-blue-50', seatsPerRow: 4 },
    SECOND: { name: '二等座', color: 'bg-green-100 text-green-800', icon: '🥉', bgColor: 'bg-green-50', seatsPerRow: 5 },
    SLEEPER_BERTH: {name: '卧铺', color: 'bg-red-100 text-red-800', icon:'' ,bgColor:'bg-red-50',seatsPerRow:3}
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await get("/seat/get", { userId });
        if (res.code == 200) {
          setSeatData(res.data); 
        } else {
          toast.error("获取座位数据失败");
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching seat data:', error);
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  // 获取可用列车列表
  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const res = await get("/train/get",{managerId:userId,key:''});
        if (res.code === 200) {
          setAvailableTrains(res.data);
        }
      } catch (error) {
        console.error('Error fetching trains:', error);
      }
    };
    
    fetchTrains();
  }, []);

  // 处理数据，按列车分组并统计车厢座位
  useEffect(() => {
    if (seatData.length > 0) {
      const trainMap = new Map();

      seatData.forEach(seat => {
        const trainId = seat.train.trainId;
        
        if (!trainMap.has(trainId)) {
          trainMap.set(trainId, {
            train: seat.train,
            carriages: [],
            totalSeats: 0
          });
        }

        const trainInfo = trainMap.get(trainId);
        let carriage = trainInfo.carriages.find(c => c.carriageNumber === seat.carriageNumber);
        
        if (!carriage) {
          carriage = {
            carriageNumber: seat.carriageNumber,
            FIRST: 0,
            SECOND: 0,
            BUSINESS: 0,
            SLEEPER_BERTH:0,
            total: 0
          };
          trainInfo.carriages.push(carriage);
        }

        carriage[seat.seatClass]++;
        carriage.total++;
        trainInfo.totalSeats++;
      });

      // 对车厢进行排序
      trainMap.forEach(train => {
        train.carriages.sort((a, b) => parseInt(a.carriageNumber) - parseInt(b.carriageNumber));
      });

      setTrainData(Array.from(trainMap.values()));
    }
  }, [seatData]);

  const scrollCarriages = (trainId, direction) => {
    const container = document.getElementById(`carriages-${trainId}`);
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // 添加车厢
  const handleAddCarriage = async (trainId) => {
    const train = trainData.find(t => t.train.trainId === trainId);
    if (!train) return;
    
    const newCarriageNumber = train.carriages.length > 0 
      ? (Math.max(...train.carriages.map(c => parseInt(c.carriageNumber))) + 1).toString()
      : "1";
    
    try {
      // 这里应该调用实际的API
      console.log('Adding carriage:', { trainId, carriageNumber: newCarriageNumber });
      
      // 更新本地状态
      const newCarriage = {
        carriageNumber: newCarriageNumber,
        FIRST: 0,
        SECOND: 0,
        BUSINESS: 0,
        total: 0
      };
      
      setTrainData(trainData.map(t => 
        t.train.trainId === trainId 
          ? { ...t, carriages: [...t.carriages, newCarriage] }
          : t
      ));
    } catch (error) {
      console.error('Error adding carriage:', error);
    }
  };

  // 删除车厢
  const handleRemoveCarriage = async (trainId, carriageNumber) => {
    try {
      console.log('Removing carriage:', { trainId, carriageNumber });
      
      setTrainData(trainData.map(t => 
        t.train.trainId === trainId 
          ? { 
              ...t, 
              carriages: t.carriages.filter(c => c.carriageNumber !== carriageNumber).map(c => c.carriageNumber>carriageNumber?{...c,carriageNumber:c.carriageNumber-1}:c),
              totalSeats: t.totalSeats - (t.carriages.find(c => c.carriageNumber === carriageNumber)?.total || 0)
            }
          : t
      ));
    } catch (error) {
      console.error('Error removing carriage:', error);
    }
  };

  // 开始编辑车厢座位
  const startEditingCarriage = (trainId, carriageNumber) => {
    const train = trainData.find(t => t.train.trainId === trainId);
    const carriage = train?.carriages.find(c => c.carriageNumber === carriageNumber);
    
    if (carriage) {
      setEditingCarriage({ trainId, carriageNumber });
      setEditingSeatCounts({
        FIRST: carriage.FIRST,
        SECOND: carriage.SECOND,
        BUSINESS: carriage.BUSINESS,
        SLEEPER_BERTH: carriage.SLEEPER_BERTH
      });
    }
  };

  // 保存车厢座位编辑
  const handleSaveCarriageEdit = async () => {
    if (!editingCarriage) return;
    
    try {
      console.log('Updating carriage seats:', editingCarriage, editingSeatCounts);
      
      setTrainData(trainData.map(t => 
        t.train.trainId === editingCarriage.trainId 
          ? {
              ...t,
              carriages: t.carriages.map(c => 
                c.carriageNumber === editingCarriage.carriageNumber
                  ? {
                      ...c,
                      ...editingSeatCounts,
                      total: editingSeatCounts.FIRST + editingSeatCounts.SECOND + editingSeatCounts.BUSINESS + editingSeatCounts.SLEEPER_BERTH
                    }
                  : c
              )
            }
          : t
      ));
      
      setEditingCarriage(null);
    } catch (error) {
      console.error('Error updating carriage seats:', error);
    }
  };

  // 添加座位到选定列车
  const handleAddSeatsToTrain = async () => {
    if (!selectedTrain || !newSeatData.carriageNumber) {
      toast.error("请选择列车并填写车厢号");
      return;
    }
    
    try {
      const response = await post("/seat/add",newSeatData, {
        userId,
        trainId: selectedTrain.trainId
      });
      console.log(response)
      if (response.code === 200) {
        toast.success("座位添加成功");
        setShowAddSeatModal(false);
        setSelectedTrain(null);
        setNewSeatData({
          carriageNumber: "",
          firNumber: 0,
          secNumber: 0,
          busNumber: 0,
          sleNumber: 0
        });
        
        // 重新获取座位数据
        const res = await get("/seat/get", { userId });
        if (res.code == 200) {
          setSeatData(res.data);
        }
      } else {
        toast.error(response.message || "座位添加失败");
      }
    } catch (error) {
      console.error('Error adding seats:', error);
      toast.error("座位添加失败");
    }
  };

  // 计算总座位数
  const calculateTotalSeats = () => {
    const { firNumber, secNumber, busNumber } = newSeatData;
    return firNumber * 4 + secNumber * 5 + busNumber * 2;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">列车座位管理</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Train className="h-4 w-4" />
              <span>{trainData.length} 列车</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>{trainData.reduce((sum, train) => sum + train.totalSeats, 0)} 座位</span>
            </div>
          </div>
          <button
            onClick={() => setShowAddSeatModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>添加座位</span>
          </button>
        </div>
      </div>

      {/* 列车列表 */}
      <div className="space-y-6">
        {trainData.map((train) => (
          <div key={train.train.trainId} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* 列车头部信息 */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-3">
                    <Train className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{train.train.trainNo}</h2>
                    <p className="text-blue-100">
                      {train.train.trainType}车型
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{train.totalSeats}</div>
                  <div className="text-blue-100">总座位数</div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-blue-100">
                  <span>列车状态:</span>
                  <span className="font-medium">
                    {train.train.isActive ? '运营中' : '停运'}
                  </span>
                </div>
                {/* <button
                  onClick={() => handleAddCarriage(train.train.trainId)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  <span>添加车厢</span>
                </button> */}
              </div>
            </div>

            {/* 车厢滚动区域 */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">车厢座位分布</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => scrollCarriages(train.train.trainId, 'left')}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => scrollCarriages(train.train.trainId, 'right')}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* 横向滚动的车厢列表 */}
              <div 
                id={`carriages-${train.train.trainId}`}
                className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                style={{ scrollbarWidth: 'thin' }}
              >
                {train.carriages.map((carriage) => (
                  <div 
                    key={carriage.carriageNumber} 
                    className="flex-shrink-0 bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-blue-300 transition-colors min-w-[220px] relative group"
                  >
                    {/* 车厢操作按钮 */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <button
                        onClick={() => startEditingCarriage(train.train.trainId, carriage.carriageNumber)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveCarriage(train.train.trainId, carriage.carriageNumber)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-center mb-3">
                      <h4 className="font-semibold text-gray-900">第{carriage.carriageNumber}车厢</h4>
                      <p className="text-sm text-gray-600">共 {carriage.total} 座</p>
                    </div>
                    
                    {editingCarriage?.trainId === train.train.trainId && editingCarriage?.carriageNumber === carriage.carriageNumber ? (
                      <div className="space-y-3">
                        {['BUSINESS', 'FIRST', 'SECOND','SLEEPER_BERTH'].map((seatClass) => {
                          const config = seatClassConfig[seatClass];
                          return (
                            <div key={seatClass} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">{config.icon}</span>
                                <span className="text-sm font-medium text-gray-700">
                                  {config.name}(行)
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => setEditingSeatCounts({
                                    ...editingSeatCounts,
                                    [seatClass]: Math.max(0, editingSeatCounts[seatClass] - 1)
                                  })}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={editingSeatCounts[seatClass]}
                                  onChange={(e) => setEditingSeatCounts({
                                    ...editingSeatCounts,
                                    [seatClass]: Math.max(0, parseInt(e.target.value) || 0)
                                  })}
                                  className="w-12 text-center border border-gray-300 rounded px-1 py-0.5 text-xs"
                                />
                                <button
                                  onClick={() => setEditingSeatCounts({
                                    ...editingSeatCounts,
                                    [seatClass]: editingSeatCounts[seatClass] + 1
                                  })}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={handleSaveCarriageEdit}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs"
                          >
                            <Save className="h-3 w-3 inline mr-1" />
                            保存
                          </button>
                          <button
                            onClick={() => setEditingCarriage(null)}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-1 px-2 rounded text-xs"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {['BUSINESS', 'FIRST', 'SECOND','SLEEPER_BERTH'].map((seatClass) => {
                          const count = carriage[seatClass];
                          const config = seatClassConfig[seatClass];
                          
                          if (count === 0) return null;
                          
                          return (
                            <div key={seatClass} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">{config.icon}</span>
                                <span className="text-sm font-medium text-gray-700">
                                  {config.name}
                                </span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                  </div>
                ))}
              </div>
            </div>

            {/* 列车统计信息 */}
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-orange-600">
                    {train.carriages.reduce((sum, c) => sum + c.BUSINESS, 0)}
                  </div>
                  <div className="text-sm text-gray-600">商务座</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {train.carriages.reduce((sum, c) => sum + c.FIRST, 0)}
                  </div>
                  <div className="text-sm text-gray-600">一等座</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {train.carriages.reduce((sum, c) => sum + c.SECOND, 0)}
                  </div>
                  <div className="text-sm text-gray-600">二等座</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {train.carriages.reduce((sum, c) => sum + c.SLEEPER_BERTH, 0)}
                  </div>
                  <div className="text-sm text-gray-600">卧铺</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {trainData.length === 0 && (
        <div className="text-center py-12">
          <Train className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">暂无列车数据</p>
        </div>
      )}

      {/* 添加座位模态框 */}
      {showAddSeatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">添加座位</h3>
              <button 
                onClick={() => setShowAddSeatModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择列车</label>
                <button
                  onClick={() => setShowTrainSelector(true)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-left hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  {selectedTrain ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{selectedTrain.trainNo}</span>
                        <span className="text-sm text-gray-600 ml-2">({selectedTrain.trainType}车型)</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${selectedTrain.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                  ) : (
                    <span className="text-gray-500">点击选择列车</span>
                  )}
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">车厢号</label>
                <input
                  type="text"
                  value={newSeatData.carriageNumber}
                  onChange={(e) => setNewSeatData({...newSeatData, carriageNumber: e.target.value})}
                  placeholder="请输入车厢号"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">座位类型配置</h4>
                
                {[
                  { key: 'busNumber', label: '商务座行数', seatsPerRow: 2, color: 'bg-orange-100 text-orange-800' },
                  { key: 'firNumber', label: '一等座行数', seatsPerRow: 4, color: 'bg-blue-100 text-blue-800' },
                  { key: 'secNumber', label: '二等座行数', seatsPerRow: 5, color: 'bg-green-100 text-green-800' },
                  { key: 'sleNumber', label: '卧铺行数',   seatsPerRow: 3, color: 'bg-red-100 text-red-800' }
                ].map((type) => (
                  <div key={type.key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{type.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setNewSeatData({
                          ...newSeatData,
                          [type.key]: Math.max(0, newSeatData[type.key] - 1)
                        })}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={newSeatData[type.key]}
                        onChange={(e) => setNewSeatData({
                          ...newSeatData,
                          [type.key]: Math.max(0, parseInt(e.target.value) || 0)
                        })}
                        className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                      />
                      <button
                        onClick={() => setNewSeatData({
                          ...newSeatData,
                          [type.key]: newSeatData[type.key] + 1
                        })}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${type.color}`}>
                        {newSeatData[type.key] * type.seatsPerRow} 座
                      </span>
                    </div>
                  </div>
                ))}
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">总座位数</span>
                    <span className="text-lg font-bold text-blue-600">{calculateTotalSeats()} 座</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddSeatsToTrain}
                disabled={!selectedTrain || !newSeatData.carriageNumber || calculateTotalSeats() === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
              >
                确认添加
              </button>
              <button
                onClick={() => {
                  setShowAddSeatModal(false);
                  setSelectedTrain(null);
                  setNewSeatData({
                    carriageNumber: "",
                    firNumber: 0,
                    secNumber: 0,
                    busNumber: 0
                  });
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 列车选择器 */}
      {showTrainSelector && (
        <TrainSelector
          trains={availableTrains}
          selectedTrain={selectedTrain}
          onSelect={(train) => {
            setSelectedTrain(train);
            setShowTrainSelector(false);
          }}
          onClose={() => setShowTrainSelector(false)}
        />
      )}
    </div>
  );
}

export default SeatManagement;