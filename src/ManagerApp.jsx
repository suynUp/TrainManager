import Dashboard from './Manager/Dashboard';
import StationManagement from './Manager/StationManagement';
import TrainManagement from './Manager/TrainManagement';
import RouteManagement from './Manager/RouteManagement';
import PricingManagement from './Manager/PricingManagement';
import OrderManagement from './Manager/OrderManagement';
import SystemSettings from './Manager/SystemSettings';
import SeatManagement from './Manager/SeatManager';

import { 
  Train, 
  MapPin, 
  Route, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAtom } from 'jotai';
import { tokenAtom, userAtom, userIdAtom } from './atoms/userAtoms';
import { atomWithStorage } from 'jotai/utils';
import { useLocation } from 'wouter';

const pageAtom = atomWithStorage('dashboard')

const Manager = () => {
  const [activeTab, setActiveTab] = useAtom(pageAtom);

  const [user,setUser] = useAtom(userAtom)
  const [,setUserId] = useAtom(userIdAtom)
  const [,setToken] = useAtom(tokenAtom)
  const [,setLocation] = useLocation()

  const menuItems = [
    { id: 'dashboard', label: '运营监控', icon: BarChart3 },
    { id: 'stations', label: '车站管理', icon: MapPin },
    { id: 'trains', label: '车辆管理', icon: Train },
    { id: 'routes', label: '路线管理', icon: Route },
    { id: 'pricing', label: '票价管理', icon: CreditCard },
    { id: 'orders', label: '订单管理', icon: Users },
    { id: 'settings', label: '系统设置', icon: Settings },
    { id: 'seat' ,label:'座位管理' ,icon: CreditCard}
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'stations': return <StationManagement />;
      case 'trains': return <TrainManagement />;
      case 'routes': return <RouteManagement />;
      case 'pricing': return <PricingManagement />;
      case 'orders': return <OrderManagement />;
      case 'settings': return <SystemSettings />;
      case 'seat' : return <SeatManagement/>
      default: return <Dashboard />;
    }
  };

  const Logout = () => {

    setUser({})
    setUserId(-1)
    setToken('')
    setLocation("/Login")

  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边导航栏 */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Train className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">动车管理系统</h1>
              <p className="text-sm text-gray-600">管理员控制台</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-blue-50 transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">管</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{user.userName}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
             <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center">
              <LogOut className='h-[15px] w-[15px] cursor:pointer' onClick={Logout}/>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Manager;