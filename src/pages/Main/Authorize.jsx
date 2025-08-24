import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, User, CreditCard, Phone, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { post } from '../../utils/request';
import { useAtom } from 'jotai'
import { userAtom, userIdAtom } from '../AtomExport';


const RealNameAuth = () => {
  const [userId] = useAtom(userIdAtom)
  const [user] = useAtom(userAtom)
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    realName: '',
    idCard: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState({});
  const [isVerified, setIsVerified] = useState(user.real_name !== undefined);

  const onBack = () => {
    window.history.back()
  };

  // 表单验证
  const validateForm = () => {
    const newErrors = {};

    if (!formData.realName.trim()) {
      newErrors.realName = '请输入真实姓名';
    } else if (formData.realName.length < 2) {
      newErrors.realName = '姓名至少2个字符';
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // 这里应该是调用实名认证API
    console.log('提交实名认证:', formData);

    const res = await post("/user/Authorize",{},{...formData,userId})
    if(res.code === 200){
      alert("实名成功")
    }else{
      alert("实名失败")
    }
    
    // 模拟认证成功
    setIsVerified(true);
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 animate-fade-in">
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-4">
            <button 
              onClick={onBack}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 animate-slide-down">
              实名认证
            </h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="px-4 py-6  max-w-4xl m-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 text-center animate-slide-up">
            <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-200">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">实名认证成功</h2>
            <p className="text-gray-600 mb-6">您已完成实名认证</p>
            
            <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
              <div className="flex items-center mb-3">
                <User className="w-5 h-5 text-gray-500 mr-2" />
                <span className="font-medium">认证信息</span>
              </div>
              <div className="space-y-2 pl-7">
                <p className="text-gray-700">
                  <span className="text-gray-500 mr-2">姓名:</span>
                  {user?.real_name}
                </p>
                <p className="text-gray-700">
                  <span className="text-gray-500 mr-2">身份证:</span>
                  {user?.idCard.replace(/^(\d{3})\d+(\d{4})$/, '$1***********$2')}
                </p>
                <p className="text-gray-700">
                  <span className="text-gray-500 mr-2">手机号:</span>
                  {user?.phoneNumber.replace(/^(\d{3})\d+(\d{4})$/, '$1****$2')}
                </p>
              </div>
            </div>

            <button
              onClick={onBack}
              className="w-full px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
            >
              返回个人中心
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 animate-fade-in">
      {/* 表单页面头部 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 animate-slide-down">
            实名认证
          </h1>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            提交认证
          </button>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 animate-slide-up">
          {/* 真实姓名输入 */}
          <div className="p-5 border-b border-gray-100/50">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <User className="w-4 h-4 text-white" />
              </div>
              <label className="text-sm font-semibold text-gray-700">真实姓名</label>
              <span className="text-red-500 ml-1">*</span>
            </div>
            <input
              type="text"
              value={formData.realName}
              onChange={(e) => setFormData(prev => ({ ...prev, realName: e.target.value }))}
              placeholder="请输入您的真实姓名"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 ${
                errors.realName ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
              }`}
            />
            {errors.realName && (
              <div className="flex items-center mt-2 text-red-600 text-sm animate-shake">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.realName}
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
          <div className="p-5">
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
        </div>

        {/* 温馨提示 */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm">
              <p className="font-semibold mb-2 text-blue-900">认证须知</p>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  <span>请确保填写的信息与身份证件完全一致</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealNameAuth;