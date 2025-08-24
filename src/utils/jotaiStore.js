// src/utils/jotaiStore.js
import { createStore } from 'jotai';
import { tokenAtom } from '../atoms/userAtoms';

// 创建全局 store 实例
export const store = createStore();

// 提供 store 的访问方法
export const getStore = () => store;