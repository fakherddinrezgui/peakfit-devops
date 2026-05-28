import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8091';
const Ctx  = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const setToken = t => {
    if (t) axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    else   delete axios.defaults.headers.common['Authorization'];
  };
  const login = async (email, password) => {
    const { data } = await axios.post(`${BASE}/api/auth/login`, { email, password });
    setToken(data.token); setUser(data.user); return data.user;
  };
  const register = async (d) => {
    const { data } = await axios.post(`${BASE}/api/auth/register`, d);
    setToken(data.token); setUser(data.user); return data.user;
  };
  const logout = () => { setToken(null); setUser(null); };
  const refreshUser = async () => {
    try { const { data } = await axios.get(`${BASE}/api/auth/me`); setUser(data); }
    catch { logout(); }
  };
  return <Ctx.Provider value={{user,login,register,logout,refreshUser}}>{children}</Ctx.Provider>;
};
export const useAuth = () => useContext(Ctx);
