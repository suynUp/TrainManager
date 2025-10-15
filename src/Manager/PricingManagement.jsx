import React, { useEffect, useState } from 'react';
import { Plus, X, Edit2, Trash2, Save, ChevronUp, ChevronDown } from 'lucide-react';
import { get, post, put, del } from '../utils/request';
import { useAtom } from 'jotai';
import { userIdAtom } from '../atoms/userAtoms';
import { toast, ToastContainer } from 'react-toastify';

function PricingManagement() {
  const [userId] = useAtom(userIdAtom);
  
  // 状态管理
  const [basePrices, setBasePrices] = useState([]);
  const [basePriceShow, setBasePriceShow] = useState([]);
  const [priceRules, setPriceRules] = useState([]);
  const [trigger, setTrigger] = useState(false);
  
  // 模态框状态
  const [showBasePriceModal, setShowBasePriceModal] = useState(false);
  
  // 编辑状态
  const [editingBasePrice, setEditingBasePrice] = useState(null);
  const [editingRules, setEditingRules] = useState([]);
  const [isEditingRules, setIsEditingRules] = useState(false);
  
  // 表单数据
  const [newBasePrice, setNewBasePrice] = useState({
    basePriceRate: 0,
    seatClass: 'SECOND',
    trainType: 'G'
  });

  // 座位类型映射
  const seatClassMap = {
    'SECOND': { name: '二等座', color: 'text-green-600' },
    'FIRST': { name: '一等座', color: 'text-blue-600' },
    'BUSINESS': { name: '商务座', color: 'text-orange-600' },
    'SLEEPER_BERTH': { name: '卧铺', color:' text-purple-600 '}
  };

  // 生成规则名称
  const generateRuleName = (lowerBound, upperBound) => {
    if (upperBound === null) {
      return `${lowerBound}km以上`;
    }
    return `${lowerBound}-${upperBound}km`;
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
        setBasePriceShow(groupByTrainType(basePriceRes.data));
        
        const priceRuleRes = await get("/priceRule/get", { userId });
        console.log('Price Rule Data:', priceRuleRes.data);
        
        // 按lowerBound排序
        const sortedRules = (priceRuleRes.data || []).sort((a, b) => a.lowerBound - b.lowerBound);
        setPriceRules(sortedRules);
        setEditingRules([...sortedRules]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    if (userId) {
      fetchData();
    }
  }, [userId, trigger]);

  // 基础价格操作 - 保持不变
  const handleAddBasePrice = async () => {
    try {
      console.log(newBasePrice)
      if(basePrices.some(bp=>bp.seatClass===newBasePrice.seatClass&&bp.trainType===newBasePrice.trainType)){
        toast.error('已有策略')
        return;
      }
      const response = await post('/basePrice/add', [newBasePrice], { userId });
      if (response.code == 200) {
        setNewBasePrice({ basePriceRate: 0, seatClass: 'SECOND', trainType: 'G' });
        setShowBasePriceModal(false);
        setTrigger(!trigger)
      }
    } catch (error) {
      console.error('Error adding base price:', error);
    }
  };

  const handleUpdateBasePrice = async (id, updatedPrice) => {
    console.log(updatedPrice)
    try {
      const response = await post('/basePrice/add', [updatedPrice], { userId })
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
      const response = await get(`/basePrice/delete`, { basePriceId:id });
      if (response.code == 200) {
        setBasePrices(basePrices.filter(price => price.id !== id));
        toast.success('成功了')
      }
    } catch (error) {
      console.error('Error deleting base price:', error);
    }
  };

  // 价格规则操作
  const validateRulesContinuity = (rules) => {
    const sortedRules = [...rules].sort((a, b) => a.lowerBound - b.lowerBound);
    
    for (let i = 0; i < sortedRules.length; i++) {
      const current = sortedRules[i];
      const next = sortedRules[i + 1];
      
      // 检查当前规则的upperBound是否等于下一个规则的lowerBound
      if (next && current.upperBound !== next.lowerBound) {
        return false;
      }
      
      // 检查最后一个规则的upperBound是否为null
      if (i === sortedRules.length - 1 && current.upperBound !== null) {
        return false;
      }
      
      // 检查上限是否高于下限
      if (current.upperBound !== null && current.upperBound <= current.lowerBound) {
        return false;
      }
    }
    
    return true;
  };

  const handleAddRule = () => {
    const lastRule = editingRules[editingRules.length - 1];
    const newLowerBound = lastRule ? lastRule.upperBound : 0;
    
    const newRule = {
      ruleName: generateRuleName(newLowerBound, null),
      lowerBound: newLowerBound,
      upperBound: null,
      discountRate: 1
    };
    
    // 如果添加的不是第一条规则，需要更新前一条规则的upperBound
    const updatedRules = [...editingRules];
    if (lastRule) {
      updatedRules[updatedRules.length - 1].upperBound = newLowerBound;
      updatedRules[updatedRules.length - 1].ruleName = generateRuleName(
        updatedRules[updatedRules.length - 1].lowerBound, 
        newLowerBound
      );
    }
    
    updatedRules.push(newRule);
    setEditingRules(updatedRules);
  };

  const handleDeleteRule = (index) => {
    const newRules = [...editingRules];
    
    if (newRules.length <= 1) {
      toast.error('至少需要保留一条规则');
      return;
    }
    
    // 如果是删除第一条规则
    if (index === 0) {
      newRules.splice(0, 1);
      // 更新新的第一条规则的lowerBound为0
      if (newRules.length > 0) {
        newRules[0].lowerBound = 0;
        newRules[0].ruleName = generateRuleName(0, newRules[0].upperBound);
      }
    } 
    // 如果是删除最后一条规则
    else if (index === newRules.length - 1) {
      newRules.splice(index, 1);
      // 更新新的最后一条规则的upperBound为null
      newRules[newRules.length - 1].upperBound = null;
      newRules[newRules.length - 1].ruleName = generateRuleName(
        newRules[newRules.length - 1].lowerBound, 
        null
      );
    }
    // 如果是删除中间规则
    else {
      const deletedRule = newRules[index];
      newRules.splice(index, 1);
      
      // 更新前一条规则的upperBound为被删除规则的upperBound
      newRules[index - 1].upperBound = deletedRule.upperBound;
      newRules[index - 1].ruleName = generateRuleName(
        newRules[index - 1].lowerBound, 
        deletedRule.upperBound
      );
    }
    
    setEditingRules(newRules);
  };

  const handleRuleChange = (index, field, value) => {
    const newRules = [...editingRules];
    
    if (field === 'lowerBound' || field === 'upperBound') {
      value = value === '' ? null : parseInt(value);
    } else if (field === 'discountRate') {
      value = parseFloat(value);
    }
    
    // 验证上限必须高于下限
    if (field === 'upperBound' && value !== null && value <= newRules[index].lowerBound) {
      toast.error('上限必须高于下限');
      return;
    }
    
    // 验证下限必须小于上限
    if (field === 'lowerBound' && newRules[index].upperBound !== null && value >= newRules[index].upperBound) {
      toast.error('下限必须小于上限');
      return;
    }
    
    newRules[index][field] = value;
    
    // 自动更新规则名称
    if (field === 'lowerBound' || field === 'upperBound') {
      newRules[index].ruleName = generateRuleName(
        newRules[index].lowerBound,
        newRules[index].upperBound
      );
    }
    
    // 如果修改了upperBound，需要更新下一个规则的lowerBound
    if (field === 'upperBound' && index < newRules.length - 1) {
      newRules[index + 1].lowerBound = value;
      newRules[index + 1].ruleName = generateRuleName(
        value,
        newRules[index + 1].upperBound
      );
    }
    
    // 如果修改了lowerBound，需要更新前一个规则的upperBound
    if (field === 'lowerBound' && index > 0) {
      newRules[index - 1].upperBound = value;
      newRules[index - 1].ruleName = generateRuleName(
        newRules[index - 1].lowerBound,
        value
      );
    }
    
    setEditingRules(newRules);
  };

  const handleMoveRule = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === editingRules.length - 1)
    ) {
      return;
    }
    
    const newRules = [...editingRules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // 交换规则位置
    [newRules[index], newRules[targetIndex]] = [newRules[targetIndex], newRules[index]];
    
    // 重新计算边界
    for (let i = 0; i < newRules.length; i++) {
      if (i === 0) {
        newRules[i].lowerBound = 0;
      } else {
        newRules[i].lowerBound = newRules[i - 1].upperBound;
      }
      
      if (i === newRules.length - 1) {
        newRules[i].upperBound = null;
      }
      
      // 更新规则名称
      newRules[i].ruleName = generateRuleName(
        newRules[i].lowerBound,
        newRules[i].upperBound
      );
    }
    
    setEditingRules(newRules);
  };

  const handleSaveRules = async () => {
    // 验证规则连续性
    if (!validateRulesContinuity(editingRules)) {
      toast.error('规则连续性验证失败，请检查规则边界');
      return;
    }
    
    try {
      const response = await post('/priceRule/update', editingRules, { userId });
      
      if (response.code === 200) {
        toast.success('价格规则更新成功');
        setIsEditingRules(false);
        setTrigger(!trigger);
      } else {
        toast.error('更新失败: ' + response.message);
      }
    } catch (error) {
      console.error('Error saving price rules:', error);
      toast.error('保存失败，请稍后重试');
    }
  };

  const handleCancelEditRules = () => {
    setEditingRules([...priceRules]);
    setIsEditingRules(false);
  };

  return (
    <div className="space-y-8">
      <ToastContainer/>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">票价管理</h1>
      </div>

      {/* 基础价格管理 - 保持不变 */}
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

      {/* 距离折扣规则管理 - 修复版 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">距离折扣规则</h2>
          
          {!isEditingRules ? (
            <button
              onClick={() => setIsEditingRules(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              <span>编辑规则</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveRules}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>保存规则</span>
              </button>
              <button
                onClick={handleCancelEditRules}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                取消
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              规则必须连续，每个规则的上限(upperBound)必须等于下一个规则的下限(lowerBound)
            </p>
          </div>

          <div className="space-y-4">
            {editingRules.map((rule, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                {/* 移动按钮 */}
                {isEditingRules && (
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => handleMoveRule(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMoveRule(index, 'down')}
                      disabled={index === editingRules.length - 1}
                      className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* 规则名称 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">规则名称</label>
                    <p className="font-medium text-gray-900">{rule.ruleName}</p>
                  </div>

                  {/* 距离下限 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">距离下限 (km)</label>
                    {isEditingRules ? (
                      <input
                        type="number"
                        value={rule.lowerBound}
                        onChange={(e) => handleRuleChange(index, 'lowerBound', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        disabled={index === 0} // 只有第一个规则可以编辑lowerBound
                      />
                    ) : (
                      <p className="text-gray-900">{rule.lowerBound}km</p>
                    )}
                  </div>

                  {/* 距离上限 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">距离上限 (km)</label>
                    {isEditingRules ? (
                      <input
                        type="number"
                        value={rule.upperBound === null ? '' : rule.upperBound}
                        onChange={(e) => handleRuleChange(index, 'upperBound', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="无上限"
                        disabled={index === editingRules.length - 1} // 最后一个规则的上限不能编辑
                      />
                    ) : (
                      <p className="text-gray-900">{rule.upperBound === null ? '无上限' : `${rule.upperBound}km`}</p>
                    )}
                  </div>

                  {/* 折扣率 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">折扣率</label>
                    {isEditingRules ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="2"
                        value={rule.discountRate}
                        onChange={(e) => handleRuleChange(index, 'discountRate', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    ) : (
                      <p className={`font-medium ${
                        rule.discountRate === 1 ? 'text-gray-600' : 
                        rule.discountRate < 1 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {rule.discountRate === 1 ? '原价' : `${(rule.discountRate * 100).toFixed(0)}%`}
                      </p>
                    )}
                  </div>
                </div>

                {/* 删除按钮 */}
                {isEditingRules && editingRules.length > 1 && (
                  <button
                    onClick={() => handleDeleteRule(index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            {/* 添加规则按钮 */}
            {isEditingRules && (
              <button
                onClick={handleAddRule}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>添加规则</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 添加基础价格模态框 - 保持不变 */}
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
                  <option value="SLEEPER_BERTH">卧铺</option>
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
    </div>
  );
}

export default PricingManagement;