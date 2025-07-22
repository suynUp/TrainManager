import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit3, Trash2, User, Phone, CreditCard, Calendar, Check, X, AlertCircle } from 'lucide-react';

const PassengerManager = ({ onBack }) => {
  const [passengers, setPassengers] = useState([
    {
      id: '1',
      name: '苏煜楠',
      idCard: '320***********1234',
      phone: '138****5678',
      passengerType: '成人',
      isDefault: true
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    idCard: '',
    phone: '',
    passengerType: '成人'
  });
  const [errors, setErrors] = useState({});

  // 表单验证
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    } else if (formData.name.length < 2) {
      newErrors.name = '姓名至少2个字符';
    }

    if (!formData.idCard.trim()) {
      newErrors.idCard = '请输入身份证号';
    } else if (!/^\d{17}[\dXx]$/.test(formData.idCard)) {
      newErrors.idCard = '身份证号格式不正确';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '手机号格式不正确';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingId) {
      // 编辑现有乘车人
      setPassengers(prev => prev.map(p => 
        p.id === editingId 
          ? { 
              ...p, 
              ...formData,
              idCard: `${formData.idCard.slice(0, 3)}***********${formData.idCard.slice(-4)}`,
              phone: `${formData.phone.slice(0, 3)}****${formData.phone.slice(-4)}`
            }
          : p
      ));
    } else {
      // 添加新乘车人
      const newPassenger = {
        id: Date.now().toString(),
        ...formData,
        idCard: `${formData.idCard.slice(0, 3)}***********${formData.idCard.slice(-4)}`,
        phone: `${formData.phone.slice(0, 3)}****${formData.phone.slice(-4)}`,
        isDefault: passengers.length === 0
      };
      setPassengers(prev => [...prev, newPassenger]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      idCard: '',
      phone: '',
      passengerType: '成人'
    });
    setErrors({});
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleEdit = (passenger) => {
    setFormData({
      name: passenger.name,
      idCard: passenger.idCard.replace(/\*/g, ''),
      phone: passenger.phone.replace(/\*/g, ''),
      passengerType: passenger.passengerType
    });
    setEditingId(passenger.id);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    setPassengers(prev => prev.filter(p => p.id !== id));
  };

  const setAsDefault = (id) => {
    setPassengers(prev => prev.map(p => ({
      ...p,
      isDefault: p.id === id
    })));
  };

  const getPassengerTypeColor = (type) => {
    switch (type) {
      case '成人': return 'bg-blue-100 text-blue-700';
      case '儿童': return 'bg-green-100 text-green-700';
      case '学生': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (showAddForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 表单页面头部 */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button 
              onClick={resetForm}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-medium text-gray-900">
              {editingId ? '编辑乘车人' : '添加乘车人'}
            </h1>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              保存
            </button>
          </div>
        </div>

        <div className="px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm">
            {/* 姓名输入 */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center mb-2">
                <User className="w-5 h-5 text-gray-400 mr-2" />
                <label className="text-sm font-medium text-gray-700">姓名</label>
                <span className="text-red-500 ml-1">*</span>
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入真实姓名"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </div>
              )}
            </div>

            {/* 身份证输入 */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center mb-2">
                <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
                <label className="text-sm font-medium text-gray-700">身份证号</label>
                <span className="text-red-500 ml-1">*</span>
              </div>
              <input
                type="text"
                value={formData.idCard}
                onChange={(e) => setFormData(prev => ({ ...prev, idCard: e.target.value }))}
                placeholder="请输入18位身份证号"
                maxLength={18}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.idCard ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.idCard && (
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.idCard}
                </div>
              )}
            </div>

            {/* 手机号输入 */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center mb-2">
                <Phone className="w-5 h-5 text-gray-400 mr-2" />
                <label className="text-sm font-medium text-gray-700">手机号</label>
                <span className="text-red-500 ml-1">*</span>
              </div>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="请输入11位手机号"
                maxLength={11}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.phone && (
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.phone}
                </div>
              )}
            </div>

            {/* 乘客类型选择 */}
            <div className="p-4">
              <div className="flex items-center mb-3">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <label className="text-sm font-medium text-gray-700">乘客类型</label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['成人', '儿童', '学生'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormData(prev => ({ ...prev, passengerType: type }))}
                    className={`py-2 px-4 rounded-lg border-2 transition-all ${
                      formData.passengerType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 温馨提示 */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">温馨提示</p>
                <ul className="space-y-1 text-blue-600">
                  <li>• 请确保姓名与身份证件完全一致</li>
                  <li>• 儿童票需要提供有效身份证件</li>
                  <li>• 学生票需要提供学生证等相关证明</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-900">乘车人管理</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* 乘车人列表 */}
        <div className="space-y-3">
          {passengers.map((passenger) => (
            <div key={passenger.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900 mr-2">{passenger.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPassengerTypeColor(passenger.passengerType)}`}>
                        {passenger.passengerType}
                      </span>
                      {passenger.isDefault && (
                        <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                          默认
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span>{passenger.idCard}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{passenger.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(passenger)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {!passenger.isDefault && (
                      <button
                        onClick={() => handleDelete(passenger.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {!passenger.isDefault && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setAsDefault(passenger.id)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      设为默认乘车人
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {passengers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">还没有添加乘车人</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              添加乘车人
            </button>
          </div>
        )}

        {/* 使用说明 */}
        {passengers.length > 0 && (
          <div className="mt-8 bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-3">使用说明</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>最多可添加10个常用乘车人</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>默认乘车人将在购票时自动选中</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>请确保信息准确，以免影响出行</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerManager;