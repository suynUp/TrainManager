import  { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, MapPin } from 'lucide-react';
import { get, post } from '../utils/request';
import { useAtom } from 'jotai';
import { userIdAtom } from '../atoms/userAtoms';
import { motion } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';
import { toast, ToastContainer } from 'react-toastify';

const StationManagement = () => {

  const [stations, setStations] = useState([]);
  const [sear,setSear] = useState('')

  const [isChange,setIsChange] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData,setFormData] = useState({
    city:"",
    stationCode:"",
    stationId:1,
    stationName:"",
    status:"",
    province:""
  })

  const [trigger,setTrigger] = useState(false)

  const [userId] = useAtom(userIdAtom)

  useEffect(()=>{
    const getStation = async () => {
      const res = await get("/station/search",{stationName:sear,userId})
      if(res.code == 200){
        setStations(res.data.map(s => { return {...s,status:convertStatus(s.status)}}))
      }else{
        toast("失败啊")
      }
    }
    getStation()
  },[sear,trigger])

// 统一转换方法
  const convertStatus = (input) => {

    const statusMapping = new Map([
      ["UNDER_CONSTRUCTION", "在建"],
      ["IN_OPERATION", "运营"],
      ["OUT_OF_SERVICE", "停用"]
    ]);

    // 如果是关键字（英文大写），转换为中文
    if (statusMapping.has(input)) {
      return statusMapping.get(input);
    }
    
    // 如果是中文，转换为关键字
    for (let [key, value] of statusMapping) {
      if (value === input) return key;
    }
    return "未知状态/UNKNOWN";
  }

  const changeStation = (station) => {
    setShowAddForm(true)
    setIsChange(true)
    setFormData(station)
  }

  const addStation = async () => {

    const body = {
      ...formData,
      status:convertStatus(formData.status),
      stationId:null
    }

    const res = await post("station/add",body,{userId})
    if(res.code == 200){
      toast('成功啦')
      setTrigger(!trigger)
      setFormData({
        city:"",
        stationCode:"",
        stationId:1,
        stationName:"",
        status:"",
        province:""
      })
    }else {
      toast("失败啊")
    }

  }

  const statusOptions = [
    { value: '在建' },
    { value: '运营' },
    { value: '停用' }
  ];

  return (
    <div className="space-y-6 relative">
      <ToastContainer></ToastContainer>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">车站管理</h1>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>添加车站</span>
        </button>
      </div>

      {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-white rounded-lg shadow-md p-6 overflow-hidden"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {isChange ? '修改车站信息' : '添加新车站'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="flex text-sm font-medium text-gray-700 mb-1">
                  车站名称  <p className='ml-[3px] text-red-500'>*</p>
                </label>
                <input
                  type="text"
                  value={formData.stationName}
                  onChange={(e) =>{setFormData({
                    ...formData,
                    stationName:e.target.value
                  })}}
                  placeholder="请输入车站名称"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              
              {/* 省份调整到城市前面 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  所属省份
                </label>
                <input
                  type="text"
                  value={formData.province}
                   onChange={(e) =>{setFormData({
                    ...formData,
                    province:e.target.value
                  })}}
                  placeholder="请输入省份名称"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  所属城市
                </label>
                <input
                  type="text"
                  value={formData.city}
                   onChange={(e) =>{setFormData({
                    ...formData,
                    city:e.target.value
                  })}}
                  placeholder="请输入城市名称"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              
              <div>
                <label className="flex text-sm font-medium text-gray-700 mb-1">
                  车站代码 <p className='ml-[3px] text-red-500'>*</p>
                </label>
                <input
                  type="text"
                  value={formData.stationCode}
                   onChange={(e) =>{setFormData({
                    ...formData,
                    stationCode:e.target.value
                  })}}
                  placeholder="请输入车站代码"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
            
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="z-[100]"> 
                <label className="flex text-sm font-medium text-gray-700 mb-1">
                  车站状态  <p className='ml-[3px] text-red-500'>*</p>
                </label>
                <CustomSelect
                  value={formData.status}
                  onChange={(value) => {setFormData({...formData,status:value})}}
                  options={statusOptions}
                />
              </div>
              
              <div className="flex items-end ">
                <div className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">在建</span>
                    <span className="text-sm text-gray-500">车站正在建设中</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-sm font-medium text-gray-700">运营</span>
                    <span className="text-sm text-gray-500">车站正常运营中</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <span className="text-sm font-medium text-gray-700">停用</span>
                    <span className="text-sm text-gray-500">车站已停止使用</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              onClick={addStation}>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  保存
                </span>
              </button>
              
              <button 
                onClick={() => {
                  setShowAddForm(false)
                  setFormData({ city:"",
                                stationCode:"",
                                stationId:1,
                                stationName:"",
                                status:"",
                                province:""})
                  setIsChange(false)
                }}
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

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">车站列表</h2>
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索车站..."
                value={sear}
                onChange={(e) => { setSear(e.target.value) }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className={`${showAddForm?'max-h-[45vh]':'max-h-[80vh]'} overflow-x-auto`}>
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车站信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">所属省份</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">所属城市</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车站代码</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stations.map((station) => (
                <tr key={station.stationId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-blue-500 mr-3" />
                      <span className="font-medium text-gray-900">{station.stationName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {station.province || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{station.city || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                      {station.stationCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      station.status === '运营' 
                        ? 'bg-green-100 text-green-800' 
                        : station.status === '在建'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {station.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Edit className="h-4 w-4" 
                      onClick={()=>{changeStation(station)}}
                      />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StationManagement;