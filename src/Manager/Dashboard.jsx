import { 
  Train, 
  MapPin, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  DollarSign,
  ArrowRight
} from 'lucide-react';

// 模拟数据
const mockTrains = [
  { id: 1, number: 'G1', type: '复兴号', seats: 556, status: '运营中' },
  { id: 2, number: 'G3', type: '复兴号', seats: 556, status: '运营中' },
  { id: 3, number: 'D101', type: '和谐号', seats: 610, status: '停运' },
];

const mockRoutes = [
  { id: 1, name: '京沪高铁', stations: ['北京南', '上海虹桥'], distance: '1318km', duration: '4小时28分' },
  { id: 2, name: '沪杭高铁', stations: ['上海虹桥', '杭州东'], distance: '159km', duration: '1小时' },
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">运营监控面板</h1>
        <div className="text-sm text-gray-500">
          最后更新: {new Date().toLocaleString('zh-CN')}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">运营列车</p>
              <p className="text-3xl font-bold text-blue-600">2</p>
            </div>
            <Train className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-4 flex items-center text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-sm">正常运营</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">活跃车站</p>
              <p className="text-3xl font-bold text-green-600">3</p>
            </div>
            <MapPin className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4 flex items-center text-yellow-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span className="text-sm">1站维护中</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">今日订单</p>
              <p className="text-3xl font-bold text-purple-600">128</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-4 flex items-center text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-sm">+15% 较昨日</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">今日收入</p>
              <p className="text-3xl font-bold text-yellow-600">¥-100</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="mt-4 flex items-center text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-sm">+12% 较昨日</span>
          </div>
        </div>
      </div>

      {/* 实时状态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">实时列车状态</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockTrains.filter(t => t.status === '运营中').map(train => (
                <div key={train.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded text-white text-sm font-bold flex items-center justify-center">
                      {train.number}
                    </div>
                    <div>
                      <p className="font-medium">{train.type}</p>
                      <p className="text-sm text-gray-600">{train.seats}座</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-600 text-sm">正点运行</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">热门路线</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockRoutes.map(route => (
                <div key={route.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{route.name}</p>
                    <p className="text-sm text-gray-600">{route.stations.join(' → ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{route.distance}</p>
                    <p className="text-sm text-gray-600">{route.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;