import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Edit3, Trash2, User, Phone, CreditCard, Calendar, AlertCircle, Users, Shield } from 'lucide-react';
import { useLocation } from 'wouter';
import { get, post } from '../../utils/request';
import { useAtom } from 'jotai';
import { userIdAtom } from '../AtomExport';
import { ToastContainer, toast } from 'react-toastify';

const PassengerManager = () => {

  const [userId] = useAtom(userIdAtom)

  const [,setLocation] = useLocation()

  const [passengers, setPassengers] = useState([
    {
      passengerId: '1',
      name: '苏煜楠',
      idCard: '320***********1234',
      phoneNumber: '138****5678',
      passengerType: '成人',
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    idCard: '',
    phoneNumber: '',
    passengerType: '成人'
  });
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  
  useEffect(()=>{
    if(userId === -1){
      setLocation('/Login')
    }
    getPassenger()
  },[])

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
      setPassengers(response.data.map(p=>{return {...p,passengerType:typeConverter(p.passengerType)}}))
    }else{
      alert('失败')
    }
  }

  const typeConverter = (type) => {
  const map = { 成人: 'ADULT', 儿童: 'CHILD', 学生: 'STUDENT' };
  return map[type] || { ADULT: '成人', CHILD: '儿童', STUDENT: '学生' }[type] || type;
};

  const onBack = () => {
    window.history.back();
  }

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

    if (!formData.phoneNumber.trim()) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phone = '手机号格式不正确';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    let isAdd = true;

    let changeP;

    if (editingId) {
      // 编辑现有乘车人
      setPassengers(prev => prev.map(p => 
        p.passengerId === editingId 
          ? { 
              ...p, 
              ...formData,
              idCard: `${formData.idCard.slice(0, 3)}***********${formData.idCard.slice(-4)}`,
              phoneNumber: `${formData.phoneNumber.slice(0, 3)}****${formData.phoneNumber.slice(-4)}`
            }
          : p
      ));
      changeP = passengers.filter(p=>p.passengerId === editingId).map(p=>{return {...p, 
              ...formData,
              idCard: `${formData.idCard}`,
              phoneNumber: `${formData.phoneNumber}`,passengerType:typeConverter(p.passengerType)}})[0]
      isAdd = false
    } else {
      // 添加新乘车人
      const newPassenger = {
        id: Date.now().toString(),
        ...formData,
        idCard: `${formData.idCard}`,
        phoneNumber: `${formData.phoneNumber}`,
      };
      changeP = {...newPassenger,passengerType:typeConverter(newPassenger.passengerType)}
    }

    update(changeP,isAdd)

    resetForm();
  };

  const update = async (passenger,isAdd) => {

    const res = await post("/passenger/add",passenger,{userId})
    if(res.code === 200){
      if(isAdd){
        toast('添加成功')
        setPassengers(...passengers,res.data)
      }else{
        toast('修改成功')
      }
    }else{
      toast('失败')
      console.log(res)
    }

  }

  const resetForm = () => {
    setFormData({
      name: '',
      idCard: '',
      phoneNumber: '',
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
      phoneNumber: passenger.phoneNumber.replace(/\*/g, ''),
      passengerType: passenger.passengerType
    });
    setEditingId(passenger.passengerId);
    setShowAddForm(true);
  };

  const handleDelete = async (passengerId) => {

    const res = await post("/passenger/delete",{},{userId,passengerId})

    if(res.code == 200){
      setPassengers(prev => prev.filter(p => p.passengerId !== passengerId));
      setDeleteConfirm(null);
      toast("Wow so easy!")
    }else{
      console.log(res.data)
    }

  };

  const getPassengerTypeColor = (type) => {
    switch (type) {
      case '成人': return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200';
      case '儿童': return 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-200';
      case '学生': return 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPassengerTypeIcon = (type) => {
    switch (type) {
      case '成人': return <User className="w-3 h-3" />;
      case '儿童': return <Users className="w-3 h-3" />;
      case '学生': return <Shield className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  if (showAddForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 animate-fade-in">
        {/* 表单页面头部 */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-4">
            <button 
              onClick={resetForm}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 animate-slide-down">
              {editingId ? '编辑乘车人' : '添加乘车人'}
            </h1>
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              保存
            </button>
          </div>
        </div>

        <div className="px-4 py-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 animate-slide-up">
            {/* 姓名输入 */}
            <div className="p-5 border-b border-gray-100/50">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-white" />
                </div>
                <label className="text-sm font-semibold text-gray-700">姓名</label>
                <span className="text-red-500 ml-1">*</span>
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入真实姓名"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 ${
                  errors.name ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}
              />
              {errors.name && (
                <div className="flex items-center mt-2 text-red-600 text-sm animate-shake">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </div>
              )}
            </div>

            {/* 身份证输入 */}
            <div className="p-5 border-b border-gray-100/50">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <label className="text-sm font-semibold text-gray-700">身份证号</label>
                <span className="text-red-500 ml-1">*</span>
              </div>
              <input
                type="text"
                value={formData.idCard}
                onChange={(e) => setFormData(prev => ({ ...prev, idCard: e.target.value }))}
                placeholder="请输入18位身份证号"
                maxLength={18}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 ${
                  errors.idCard ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}
              />
              {errors.idCard && (
                <div className="flex items-center mt-2 text-red-600 text-sm animate-shake">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.idCard}
                </div>
              )}
            </div>

            {/* 手机号输入 */}
            <div className="p-5 border-b border-gray-100/50">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <label className="text-sm font-semibold text-gray-700">手机号</label>
                <span className="text-red-500 ml-1">*</span>
              </div>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="请输入11位手机号"
                maxLength={11}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 ${
                  errors.phone ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}
              />
              {errors.phone && (
                <div className="flex items-center mt-2 text-red-600 text-sm animate-shake">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.phone}
                </div>
              )}
            </div>

            {/* 乘客类型选择 */}
            <div className="p-5">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <label className="text-sm font-semibold text-gray-700">乘客类型</label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['成人', '儿童', '学生'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormData(prev => ({ ...prev, passengerType: type }))}
                    className={`py-3 px-4 rounded-xl border-2 transition-all duration-200 font-medium hover:scale-105 active:scale-95 ${
                      formData.passengerType === type
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      {getPassengerTypeIcon(type)}
                      <span>{type}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 温馨提示 */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-semibold mb-2 text-blue-900">温馨提示</p>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                    <span>请确保姓名与身份证件完全一致</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                    <span>儿童票需要提供有效身份证件</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                    <span>学生票需要提供学生证等相关证明</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 animate-fade-in">
      
      <ToastContainer/>
      {/* 头部导航 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 animate-slide-down">乘车人管理</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* 乘车人列表 */}
        <div className="space-y-4">
          {passengers.map((passenger, index) => (
            <div 
              key={passenger.passengerId} 
              className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mr-3">{passenger.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getPassengerTypeColor(passenger.passengerType)}`}>
                        {getPassengerTypeIcon(passenger.passengerType)}
                        <span>{passenger.passengerType}</span>
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <CreditCard className="w-3 h-3 text-gray-500" />
                        </div>
                        <span className="font-mono">{passenger.idCard}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <Phone className="w-3 h-3 text-gray-500" />
                        </div>
                        <span className="font-mono">{passenger.phoneNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(passenger)}
                      className="p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                      <button
                        onClick={() => setDeleteConfirm(passenger.passengerId)}
                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {passengers.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-6 text-lg">还没有添加乘车人</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              添加乘车人
            </button>
          </div>
        )}

        {/* 使用说明 */}
        {passengers.length > 0 && (
          <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-2">
                <AlertCircle className="w-3 h-3 text-white" />
              </div>
              使用说明
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>最多可添加10个常用乘车人</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>请确保信息准确，以免影响出行</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 删除确认弹窗 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl animate-scale-in">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">确认删除</h3>
              <p className="text-gray-600 mb-6">删除后无法恢复，确定要删除这个乘车人吗？</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerManager;