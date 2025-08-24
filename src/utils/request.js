// src/utils/request.js
import { tokenAtom } from "../atoms/userAtoms";
import axios from "axios";
import { getStore } from './jotaiStore'; // 需要创建 Jotai store 实例

const BASE_URL = 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: BASE_URL,
});

// 获取当前 token（适用于非组件环境）
const getToken = () => {
  const store = getStore();
  return store.get(tokenAtom); // 从 Jotai store 读取
};

// 设置 token 的原子操作
export const setToken = (newToken) => {
  const store = getStore();
  store.set(tokenAtom, newToken); // 更新 Jotai 状态
};

// 请求拦截器
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `${token}`
  }
  return config;
});

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export const get = async (url, params = {}) => apiClient.get(url, { params });
export const post = async (url, data = {}, params = {}) => apiClient.post(url, data, { params });
export const put = async (url, data = {}, params = {}) => apiClient.put(url, data, { params });
export const del = async (url, data = {}) => apiClient.delete(url, { data });

export { apiClient };