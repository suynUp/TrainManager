import React from 'react';
import { UserPen, Settings, MessageCircle, CircleAlert, User, FileText, CheckCircle, CreditCard, HeadphonesIcon, Bell, Shield, Heart, History, Star, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAtom } from 'jotai';
import { pageAtom, userAtom } from '../AtomExport';

const UserInfo = () => {
  const [, setLocation] = useLocation();
  const [user] = useAtom(userAtom);
  const [,setPage] = useAtom(pageAtom)

  // 菜单项配置
  const menuItems = [
    { icon: User, label: '乘车人管理',onClick : () => {setLocation('/Passenger')}, path: '/Passenger', color: 'bg-blue-500' },
    { icon: FileText, label: '我的订单',onClick : () => {setPage(1)}, path: '/Orders', color: 'bg-green-500' },
    { icon: UserPen, label: '实名认证',onClick : () => {setLocation('/Auth')}, path: '/Auth', color: 'bg-purple-500' },
    { icon: Shield, label: '账户安全',onClick : () => {}, path: '/Security', color: 'bg-red-500' },
  ];

  const stats = [
    { label: '积分', value: '2,456', icon: Star, color: 'text-amber-600' },
    { label: '优惠券', value: '3张', icon: FileText, color: 'text-green-600' }
  ];

  return (
    <div className="min-h-screen">

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 用户信息卡片 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-6">
            {/* 头像区域 */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 p-1">
                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
              </div>
            </div>

            {/* 用户信息 */}
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h2 className="text-2xl font-bold text-gray-800 mr-3">
                  {JSON.stringify(user) !== '{}' ? user.userName : '请登录'}
                </h2>
                <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                  金卡会员
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {user.real_name !== null && JSON.stringify(user) !== '{}' ? (
                  <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>已实名认证</span>
                  </div>
                ) : (
                  <div className="flex items-center bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm">
                    <CircleAlert className="w-4 h-4 mr-1" />
                    <span>未实名认证</span>
                  </div>
                )}
                <span className="text-sm text-gray-500">ID: {user.userId || '--'}</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-3">
              {JSON.stringify(user) !== '{}' && (
                <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center">
                  <LogOut onClick={()=>{setUser({})}} className="w-4 h-4 mr-1" />
                  退出
                </button>
              )}
            </div>
          </div>

          {/* 数据统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 功能菜单网格 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                onClick={() =>{item.onClick()}}
                className="bg-white rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group"
              >
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{item.label}</h3>
                <p className="text-sm text-gray-500">查看和管理</p>
              </div>
            );
          })}
        </div>

        {/* 快捷操作 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">快捷操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300">
              <CreditCard className="w-5 h-5 mr-2" />
              <span className="font-medium">关注wm</span>
            </button>
            <button className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300">
              <HeadphonesIcon className="w-5 h-5 mr-2" />
              <span className="font-medium">联系客服</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;