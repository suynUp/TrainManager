import React, { useState } from 'react';
import { Settings, MessageCircle, User, FileText, Gift, CheckCircle } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

const UserInfo = () => {
 
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 w-full max-w-4xl mx-auto h-50">
    <div className="min-h-screen ">
      {/* Header */}
      我是背景
      <div className="flex justify-end items-center p-4 space-x-4 ">
        <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
          <Settings className="w-6 h-6 " />
        </button>
        <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Profile Section */}
      <div className="px-6 pb-8 ">
        <div className="flex items-center space-x-4 mb-6">
          {/* Avatar */}
          <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <User className="w-12 h-12 text-gray-500" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-3">Dave</h1>
            
            {/* Verification Badges */}
            <div className="flex flex-wrap gap-2">
              <div className="border-2 border-inherit flex items-center bg-white/95 rounded-full px-3 py-1.5 shadow-sm">
                <span className="text-sm font-medium text-gray-700 mr-1">手机核验成功</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="border-2 border-inherit flex items-center bg-white/95 rounded-full px-3 py-1.5 shadow-sm">
                <span className="text-sm font-medium text-gray-700 mr-1">已实名认证</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="border-2 border-inherit bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="grid grid-cols-3 gap-6">
            {/* Passenger Card */}
            <div className="flex flex-col items-center space-y-3 p-4 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer group">
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">乘车人</span>
            </div>

            {/* Orders Card */}
            <div className="flex flex-col items-center space-y-3 p-4 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer group">
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">我的订单</span>
            </div>

            {/* Coupons Card */}
            <div className="flex flex-col items-center space-y-3 p-4 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer group">
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Gift className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">优惠券</span>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-6 space-y-4">
          <div className="border-2 border-inherit bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <h3 className="font-semibold text-gray-800 mb-2">账户信息</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>账户余额</span>
                <span className="font-medium">¥128.50</span>
              </div>
              <div className="flex justify-between">
                <span>积分</span>
                <span className="font-medium">2,456</span>
              </div>
              <div className="flex justify-between">
                <span>会员等级</span>
                <span className="font-medium text-blue-600">金卡会员</span>
              </div>
            </div>
          </div>

          <div className="border-2 border-inherit bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <h3 className="font-semibold text-gray-800 mb-2">快捷操作</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <span className="text-sm font-medium">充值</span>
              </button>
              <button className="flex items-center justify-center py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium">客服</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default UserInfo;