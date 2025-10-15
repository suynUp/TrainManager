import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, CheckCircle, ArrowLeft} from 'lucide-react';
import { useAtom } from 'jotai';
import { userIdAtom, tokenAtom } from '../AtomExport';
import { post } from '../../utils/request';
import { useLocation } from 'wouter';
import { toast, ToastContainer } from 'react-toastify';

import backgroundImage from '../../assets/loginBg.png'
const Login = () => {
  const [,setUserId] = useAtom(userIdAtom)
  const [, setToken] = useAtom(tokenAtom);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role:1
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const goBack = () => {
    window.history.back();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin && !formData.userName.trim()) {
      newErrors.userName = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!isLogin && !formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    isLogin? login() : register()
  };

  const login = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try{
      const response = await post("/user/login",{},formData)
      console.log("login",response)
      if(response.code == 200){
        setToken(response.data.token) 
        setUserId(response.data.id)
        goBack()
      }else{
        setIsLoading(false)
        toast.error(response.message)
      }
    }catch(e){
      setIsLoading(false)
      toast(e)
    } 
  }

  const register = async () => {
     if (!validateForm()) return;

    setIsLoading(true);

    console.log(formData)

    try{
      const response = await post("/user/register",{...formData,role:null},{role:formData.role})
      console.log(response)
      if(response.code == 200){
        toast('成功啦！')
        setIsLogin(true)
        setIsLoading(false)

      }else{
        setIsLoading(false)
        toast(response.data)
      }
    }catch(e){
      setIsLoading(false)
      console.log(e)
    } 
  }

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      userName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="relative z-10">
      <div className="min-h-screen relative" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      paddingTop: '4rem' // 添加顶部内边距，为导航栏留出空间
    }}>
      <div className='flex flex-col items-center'>
      <ToastContainer></ToastContainer>
      <div className='self-start m-[50px]  bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl items-center justify-center p-[10px] fixed'>
        <ArrowLeft className=' w-[40px] h-[40px] cursor-pointer text-white hover:scale-[1.2] active:scale-[0.9]	transition:all duration-200' onClick={goBack}/>  
      </div>
      <div className="w-full max-w-md mt-[80px]">
        {/* Header */}
        <div className="text-center items-center flex flex-col justify-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <div className='bg-white w-[80%] rounded-[20px] py-[10px]'>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? '欢迎回来' : '创建账户'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? '使用你的账户登录' : '现在就加入我们'}
          </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <button
              type="button"
              onClick={()=>{setIsLogin(true)}}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={()=>{setIsLogin(false)}}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              注册
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field (Registration only) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  昵称
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.userName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入昵称"
                  />
                </div>
                {errors.userName && (
                  <p className="text-red-500 text-sm">{errors.userName}</p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                电子邮件
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="输入你的邮箱"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="输入密码"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field (Registration only) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  确认密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="确认密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                登录身份
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* 普通用户选项 */}
                <label className={`relative flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                  formData.role === 1 
                    ? "border-blue-500 bg-blue-50 shadow-md scale-[1.02]"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="1"
                    checked={formData.role === 1}
                    onChange={() => setFormData({...formData, role: 1})}
                    className="absolute opacity-0"
                  />
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      formData.role === 1 
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-400"
                    }`}>
                      {formData.role === 1 && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-gray-700">普通用户</span>
                  </div>
                </label>

                {/* 管理员选项 */}
                <label className={`relative flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                  formData.role === 2
                    ? "border-purple-500 bg-purple-50 shadow-md scale-[1.02]"
                    : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="2"
                    checked={formData.role === 2}
                    onChange={() => setFormData({...formData, role: 2})}
                    className="absolute opacity-0"
                  />
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      formData.role === 2
                        ? "border-purple-500 bg-purple-500"
                        : "border-gray-400"
                    }`}>
                      {formData.role === 2 && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-gray-700">管理员</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Forgot Password (Login only) */}
            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>{isLogin ? '登录' : '注册'}</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {isLogin ? "还没有账户？" : "已经有账户了？"}
              <button
                type="button"
                onClick={toggleMode}
                className="ml-1 text-blue-600 hover:text-blue-500 font-medium"
              >
                {isLogin ? '去注册' : '去登录'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div className='h-[60px]'></div>
    </div>
    </div>
  );
}

export default Login;