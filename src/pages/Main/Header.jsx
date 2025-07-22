import { useLocation, Link } from 'wouter';
import { Train, User, LogOut, BookMarked } from 'lucide-react';
import { useState } from 'react';

const Header = ({cPage,setCPage}) => {

  const [user, setUser] = useState();
  const [location, setLocation] = useLocation();
  
  const menuItems = [
    { id: 0, label: '车票预订', icon: Train },
    { id: 1, label: '订单记录', icon: BookMarked },
    { id: 2, label: '个人信息', icon: User },
  ];

  const onLogin = () => { 
    setLocation('/Login')
    setUser({ name: 'dave' });
  };

  const onLogout = () => { setUser(null); };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Train className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">智行火车票</span>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-grow flex justify-center space-x-8 ">
            {menuItems.map((item) => (
              <button
              onClick={()=>{
                console.log(item.id)
                setCPage(item.id) 
              }}
                key={item.id}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  cPage.valueOf() === item.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* 用户操作区 */}
          <div className="w-48 flex justify-end items-center">
            {user ? (
              <div className="flex items-center space-x-3 truncate">
                <span className="text-sm text-gray-700 truncate">欢迎，{user.name}</span>
                <button
                  onClick={onLogout}
                  className="flex-shrink-0 flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  退出
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                登录/注册
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;