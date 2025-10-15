import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { get, post, put, del } from '../utils/request';
import { useAtom } from 'jotai';
import { userIdAtom } from '../atoms/userAtoms';
import { toast, ToastContainer } from 'react-toastify';
import { motion, time } from 'framer-motion';
import DateTimePicker from '../components/DateTimePicker';

function TrainManagement() {
  const [trains, setTrains] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrain, setEditingTrain] = useState(null);
  const [formData, setFormData] = useState({
    trainNo: '',           // 对应后端的 trainNo
    trainType: '',         // 对应后端的 trainType
    isActive: true         // 对应后端的 isActive
  });
  const [trigger, setTrigger] = useState(false);
  const [userId] = useAtom(userIdAtom);

  // 列车类型选项（根据后端枚举）
  const trainTypeOptions = [
    { value: 'G', label: '高铁' },
    { value: 'D', label: '动车' },
    { value: 'C', label: '城际' },
    { value: 'K', label: '快速' },
    { value: 'T', label: '特快' },
    { value: 'Z', label: '直达' }
  ];

  useEffect(() => {
    const getTrains = async () => {
      try {
        const res = await get("/train/get", { managerId:userId, key:searchTerm });
        if (res.code === 200) {
          console.log(res.data)
          setTrains(res.data);
        } else {
          toast.error("获取车辆列表失败");
        }
      } catch (error) {
        toast.error("网络错误");
      }
    };
    getTrains();
  }, [trigger, searchTerm, userId]);

  const handleSubmit = async () => {
    if (!formData.trainNo || !formData.trainType) {
      toast.error("请填写完整信息");
      return;
    }

    try {

      let res;
        res = await post("/train/addTrain", formData, { managerId:userId });

      if (res.code === 200) {
        toast.success(editingTrain ? "更新成功" : "添加成功");
        resetForm();
        setTrigger(!trigger);
      } else {
        toast.error(res.message || "操作失败");
      }
    } catch (error) {
      toast.error("网络错误");
    }
  };

  const handleDelete = async (trainId) => {
    if (window.confirm("确定要删除这辆车吗？")) {
      try {
        const res = await del("/train/delete", { trainId }, { userId });
        if (res.code === 200) {
          toast.success("删除成功");
          setTrigger(!trigger);
        } else {
          toast.error("删除失败");
        }
      } catch (error) {
        toast.error("网络错误");
      }
    }
  };

  const handleEdit = (train) => {
    setEditingTrain(train);
    setFormData({
      trainNo: train.trainNo,
      trainType: train.trainType,
      seatCount: train.seatCount || '', // 保留seatCount但可能为空
      isActive: train.isActive
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      trainNo: '',
      trainType: '',
      seatCount: '',
      isActive: true
    });
    setShowAddForm(false)
  };

  const getTrainTypeLabel = (type) => {
    const option = trainTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  const filteredTrains = trains.filter(train =>
    train.trainNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    train.trainType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    return new Date(dateTimeString).toLocaleString('zh-CN');
  };


  return (
    <div className="space-y-6 relative">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">车辆管理</h1>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>{showAddForm ? '取消添加' : '添加车辆'}</span>
        </button>
      </div>

      {/* 添加/编辑车辆表单 */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-white rounded-lg shadow-md p-6 overflow-hidden"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            {editingTrain ? '编辑车辆信息' : '添加新车辆'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="flex text-sm font-medium text-gray-700 mb-1">
                车次号 <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.trainNo}
                onChange={(e) => setFormData({...formData, trainNo: e.target.value})}
                placeholder="如：G101"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div>
              <label className="flex text-sm font-medium text-gray-700 mb-1">
                车型 <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={formData.trainType}
                onChange={(e) => setFormData({...formData, trainType: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">请选择车型</option>
                {trainTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                运营状态
              </label>
              <select
                value={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value={true}>运营中</option>
                <option value={false}>停运</option>
              </select>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {editingTrain ? '更新' : '保存'}
              </span>
            </button>
            
            <button 
              onClick={resetForm}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                取消
              </span>
            </button>
          </div>
        </motion.div>
      )}

      {/* 车辆列表 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">车辆列表</h2>
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索车次号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div className={`${showAddForm ? 'max-h-[60vh]' : 'max-h-[80vh]'} overflow-x-auto`}>
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车次信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">运营状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrains.map((train) => (
                <tr key={train.trainId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded text-white text-sm font-bold flex items-center justify-center mr-3">
                        {train.trainNo.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{train.trainNo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {getTrainTypeLabel(train.trainType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      train.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {train.isActive ? '运营中' : '停运'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(train)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(train.trainId)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTrains.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>暂无车辆数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrainManagement;