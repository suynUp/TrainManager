import React, { useEffect, useState } from 'react';
import { Plus, X, Edit2, Trash2, Save } from 'lucide-react';
import { get, post, put, del } from '../utils/request';
import { useAtom } from 'jotai';
import { userIdAtom } from '../atoms/userAtoms';
import { toast, ToastContainer } from 'react-toastify';

function PricingManagement() {
  const [userId] = useAtom(userIdAtom);
  
  // 状态管理
  const [basePrices, setBasePrices] = useState([]);
  const [basePriceShow,setBasePriceShow] = useState([])
  const [priceRules, setPriceRules] = useState([]);
  
  // 模态框状态
  const [showBasePriceModal, setShowBasePriceModal] = useState(false);
  const [showPriceRuleModal, setShowPriceRuleModal] = useState(false);
  
  // 编辑状态
  const [editingBasePrice, setEditingBasePrice] = useState(null);
  const [editingPriceRule, setEditingPriceRule] = useState(null);
  
  // 表单数据
  const [newBasePrice, setNewBasePrice] = useState({
    basePriceRate: 0,
    seatClass: 'SECOND',
    trainType: 'G'
  });
  
  const [newPriceRule, setNewPriceRule] = useState({
    ruleName: '',
    lowerBound: 0,
    upperBound: null,
    discountRate: 1
  });

  // 座位类型映射
  const seatClassMap = {
    'SECOND': { name: '二等座', color: 'text-green-600' },
    'FIRST': { name: '一等座', color: 'text-blue-600' },
    'BUSINESS': { name: '商务座', color: 'text-orange-600' }
  };

  const groupByTrainType = (data) => {
    return data.reduce((groups, item) => {
      const trainType = item.trainType;
      if (!groups[trainType]) {
        groups[trainType] = [];
      }
      groups[trainType].push(item);
      return groups;
    }, {});
  }


  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const basePriceRes = await get("/basePrice/get", { userId });
        console.log('Base Price Data:', basePriceRes.data);
        setBasePrices(basePriceRes.data || []);
        setBasePriceShow(groupByTrainType(basePriceRes.data))
        console.log(groupByTrainType(basePriceRes.data))
        const priceRuleRes = await get("/priceRule/get", { userId });
        console.log('Price Rule Data:', priceRuleRes.data);
        setPriceRules(priceRuleRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    if (userId) {
      fetchData();
    }
  }, [userId]);

  // 基础价格操作
  const handleAddBasePrice = async () => {
    try {
      const response = await post('/basePrice/add', {
        userId,
        ...newBasePrice
      });
      if (response.success) {
        setBasePrices([...basePrices, response.data]);
        setNewBasePrice({ basePriceRate: 0, seatClass: 'SECOND', trainType: 'G' });
        setShowBasePriceModal(false);
      }
    } catch (error) {
      console.error('Error adding base price:', error);
    }
  };

  const handleUpdateBasePrice = async (id, updatedPrice) => {
    console.log(updatedPrice)
    try {
      const response = await post('/basePrice/add',[updatedPrice],{userId})
      if (response.code == 200) {
        setBasePrices(basePrices.map(price => 
          price.id === id ? { ...price, ...updatedPrice } : price
        ));
        setEditingBasePrice(null);
        toast.success("成功修改")
      }
    } catch (error) {
      console.error('Error updating base price:', error);
    }
  };

  const handleDeleteBasePrice = async (id) => {
    try {
      const response = await del(`/basePrice/delete/${id}`, { userId });
      if (response.success) {
        setBasePrices(basePrices.filter(price => price.id !== id));
      }
    } catch (error) {
      console.error('Error deleting base price:', error);
    }
  };

  // 价格规则操作
  const handleAddPriceRule = async () => {
    try {
      const response = await post('/priceRule/add', {
        userId,
        ...newPriceRule
      });
      if (response.success) {
        setPriceRules([...priceRules, response.data]);
        setNewPriceRule({ ruleName: '', lowerBound: 0, upperBound: null, discountRate: 1 });
        setShowPriceRuleModal(false);
      }
    } catch (error) {
      console.error('Error adding price rule:', error);
    }
  };

  const handleUpdatePriceRule = async (id, updatedRule) => {
    try {
      const response = await put(`/priceRule/update/${id}`, {
        userId,
        ...updatedRule
      });
      if (response.success) {
        setPriceRules(priceRules.map(rule => 
          rule.priceRuleId === id ? { ...rule, ...updatedRule } : rule
        ));
        setEditingPriceRule(null);
      }
    } catch (error) {
      console.error('Error updating price rule:', error);
    }
  };

  const handleDeletePriceRule = async (id) => {
    try {
      const response = await del(`/priceRule/delete/${id}`, { userId });
      if (response.success) {
        setPriceRules(priceRules.filter(rule => rule.priceRuleId !== id));
      }
    } catch (error) {
      console.error('Error deleting price rule:', error);
    }
  };

  return (
    <div className="space-y-8">
      <ToastContainer/>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">票价管理</h1>
      </div>

      {/* 基础价格管理 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">基础价格设置</h2>
          <button 
            onClick={() => setShowBasePriceModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>添加基础价格</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {basePrices.map((price) => (
            <div key={price.id} className="bg-white rounded-lg shadow-md p-6 relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setEditingBasePrice(price)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBasePrice(price.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {editingBasePrice?.id === price.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editingBasePrice.seatClass}
                    onChange={(e) => setEditingBasePrice({...editingBasePrice, seatClass: e.target.value})}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="text"
                    value={editingBasePrice.trainType}
                    onChange={(e) => setEditingBasePrice({...editingBasePrice, trainType: e.target.value})}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={editingBasePrice.basePriceRate}
                    onChange={(e) => setEditingBasePrice({...editingBasePrice, basePriceRate: parseFloat(e.target.value)})}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateBasePrice(price.id, editingBasePrice)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-sm"
                    >
                      <Save className="h-3 w-3 inline mr-1" />
                      保存
                    </button>
                    <button
                      onClick={() => setEditingBasePrice(null)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-1 px-2 rounded text-sm"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {seatClassMap[price.seatClass]?.name || price.seatClass}
                  </h3>
                  <div className={`text-2xl font-bold mb-2 ${seatClassMap[price.seatClass]?.color || 'text-gray-600'}`}>
                    {(price.basePriceRate * 100).toFixed(0)}%
                  </div>
                  <p className="text-sm text-gray-600 mb-2">基础价格率 ({price.trainType}车型)</p>
                  <div className="text-xs text-gray-500">
                    实际票价 = 基准价格 × {price.basePriceRate}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 距离折扣规则管理 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">距离折扣规则</h2>
          <button 
            onClick={() => setShowPriceRuleModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>添加折扣规则</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <div className="space-y-4">
              {priceRules.map((rule) => (
                <div key={rule.priceRuleId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group">
                  {editingPriceRule?.priceRuleId === rule.priceRuleId ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        value={editingPriceRule.ruleName}
                        onChange={(e) => setEditingPriceRule({...editingPriceRule, ruleName: e.target.value})}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="规则名称"
                      />
                      <input
                        type="number"
                        value={editingPriceRule.lowerBound}
                        onChange={(e) => setEditingPriceRule({...editingPriceRule, lowerBound: parseInt(e.target.value)})}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="下限(km)"
                      />
                      <input
                        type="number"
                        value={editingPriceRule.upperBound || ''}
                        onChange={(e) => setEditingPriceRule({...editingPriceRule, upperBound: e.target.value ? parseInt(e.target.value) : null})}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="上限(km)"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={editingPriceRule.discountRate}
                        onChange={(e) => setEditingPriceRule({...editingPriceRule, discountRate: parseFloat(e.target.value)})}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="折扣率"
                      />
                      <div className="col-span-full flex space-x-2">
                        <button
                          onClick={() => handleUpdatePriceRule(rule.priceRuleId, editingPriceRule)}
                          className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm"
                        >
                          <Save className="h-3 w-3 inline mr-1" />
                          保存
                        </button>
                        <button
                          onClick={() => setEditingPriceRule(null)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-1 px-3 rounded text-sm"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium text-gray-900">{rule.ruleName}</p>
                            <p className="text-sm text-gray-600">
                              距离范围: {rule.lowerBound}km - {rule.upperBound ? `${rule.upperBound}km` : '无上限'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`font-medium text-lg ${
                          rule.discountRate === 1 ? 'text-gray-600' : 
                          rule.discountRate < 1 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {rule.discountRate === 1 ? '原价' : `${(rule.discountRate * 100).toFixed(0)}%`}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                          <button
                            onClick={() => setEditingPriceRule(rule)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePriceRule(rule.priceRuleId)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 添加基础价格模态框 */}
      {showBasePriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">添加基础价格</h3>
              <button 
                onClick={() => setShowBasePriceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">座位类型</label>
                <select
                  value={newBasePrice.seatClass}
                  onChange={(e) => setNewBasePrice({...newBasePrice, seatClass: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SECOND">二等座</option>
                  <option value="FIRST">一等座</option>
                  <option value="BUSINESS">商务座</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">列车类型</label>
                <select
                  value={newBasePrice.trainType}
                  onChange={(e) => setNewBasePrice({...newBasePrice, trainType: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="G">G-高速动车组</option>
                  <option value="D">D-动车组</option>
                  <option value="C">C-城际动车组</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">基础价格率</label>
                <input
                  type="number"
                  step="0.01"
                  value={newBasePrice.basePriceRate}
                  onChange={(e) => setNewBasePrice({...newBasePrice, basePriceRate: parseFloat(e.target.value)})}
                  placeholder="如：0.46"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">实际票价 = 基准价格 × 基础价格率</p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddBasePrice}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                添加
              </button>
              <button
                onClick={() => setShowBasePriceModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加价格规则模态框 */}
      {showPriceRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">添加折扣规则</h3>
              <button 
                onClick={() => setShowPriceRuleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">规则名称</label>
                <input
                  type="text"
                  value={newPriceRule.ruleName}
                  onChange={(e) => setNewPriceRule({...newPriceRule, ruleName: e.target.value})}
                  placeholder="如：500-1000km"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">距离下限 (km)</label>
                <input
                  type="number"
                  value={newPriceRule.lowerBound}
                  onChange={(e) => setNewPriceRule({...newPriceRule, lowerBound: parseInt(e.target.value)})}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">距离上限 (km)</label>
                <input
                  type="number"
                  value={newPriceRule.upperBound || ''}
                  onChange={(e) => setNewPriceRule({...newPriceRule, upperBound: e.target.value ? parseInt(e.target.value) : null})}
                  placeholder="留空表示无上限"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">折扣率</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="2"
                  value={newPriceRule.discountRate}
                  onChange={(e) => setNewPriceRule({...newPriceRule, discountRate: parseFloat(e.target.value)})}
                  placeholder="1.0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">1.0 = 原价，0.9 = 9折，1.2 = 上浮20%</p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddPriceRule}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                添加规则
              </button>
              <button
                onClick={() => setShowPriceRuleModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PricingManagement;