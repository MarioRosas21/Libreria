// src/api/authApi.js
import axios from 'axios';

const BASE_URL = 'https://microserviciologin.onrender.com/api/auth';

export const registerUser = async (data) => {
  const res = await axios.post(`${BASE_URL}/register`, data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await axios.post(`${BASE_URL}/login`, data);
  return res.data;
};

export const getSecretQuestion = async (email) => {
  const res = await axios.post(`${BASE_URL}/get-question`, { email });
  return res.data;
};

export const verifySecretAnswer = async (data) => {
  const res = await axios.post(`${BASE_URL}/verify-answer`, data);
  return res.data;
};
