import React, { useEffect, useState } from 'react';
import { Plus, X, User, Shield, CheckCircle, Clock } from 'lucide-react';
import { get, post } from '../utils/request';
import { useAtom } from 'jotai';
import { userIdAtom } from '../atoms/userAtoms';
import { toast, ToastContainer } from 'react-toastify';

// 模拟数据

const SystemSettings = () => {

  const [userId] = useAtom(userIdAtom)

  const [admins, setAdmins] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    userName: '',
    email: '',
    role: '车站管理员'
  });

  useEffect(()=>{
    const getReview = async () => {
      const res = await get("/user/review",{managerId:userId})
      if(res.code == 200){
        setAdmins(res.data.map(i=>{return {...i,avatar:i.userName.charAt(0)}}))
      }else{
        toast.error("失败啊")
      }
    }
    getReview()
  },[])

  const handleAddAdmin = () => {
    if (newAdmin.userName && newAdmin.email && newAdmin.role) {
      const admin = {
        userId: admins.length + 1,
        userName: newAdmin.userName,
        email: newAdmin.email,
        role: newAdmin.role,
        passed: '待批准',
        avatar: newAdmin.userName.charAt(0)
      };
      setAdmins([...admins, admin]);
      setNewAdmin({ userName: '', email: '', role: '车站管理员' });
      setShowAddModal(false);
    }
  };

  const handleApproveAdmin = async (adminId) => {

    const res = await post('/user/pass',{},{userId,passId:adminId,shouldPass:true})

    if(res.code == 200){
      toast('授权完成')
    }else{
      toast.error('失败啊')
    }

    setAdmins(admins.map(admin => 
      admin.userId === adminId 
        ? { ...admin, passed: '已激活' }
        : admin
    ));
  };

  return (
    <div className="space-y-6">
      <ToastContainer/>
      <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>

      {/* 管理员管理 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">管理员管理</h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>添加管理员</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {admins.map((admin) => (
              <div key={admin.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">{admin.avatar}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{admin.userName}</p>
                    <p className="text-sm text-gray-600">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{admin.role}</p>
                    <div className="flex items-center space-x-1">
                      {admin.passed ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">已激活</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-yellow-600">待批准</span>
                        </>
                      )}
                    </div>
                  </div>
                  {!admin.passed && (
                    <button
                      onClick={() => handleApproveAdmin(admin.userId)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      批准
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 添加管理员模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">添加新管理员</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={newAdmin.userName}
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                  placeholder="请输入管理员姓名"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  placeholder="请输入邮箱地址"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色权限</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="车站管理员">车站管理员</option>
                  <option value="票务管理员">票务管理员</option>
                  <option value="总控管理员">总控管理员</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddAdmin}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                添加管理员
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">权限管理</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">总控管理员</span>
              <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">超级权限</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">车站管理员</span>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">站点权限</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">票务管理员</span>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">票务权限</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">系统维护</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">数据备份</span>
                <span className="text-sm text-gray-500">最后备份: 2小时前</span>
              </div>
            </button>
            <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">操作日志</span>
                <span className="text-sm text-gray-500">查看系统日志</span>
              </div>
            </button>
            <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">系统监控</span>
                <span className="text-sm text-green-600">运行正常</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemSettings;