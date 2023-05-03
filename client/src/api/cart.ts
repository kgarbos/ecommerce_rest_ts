import axios from 'axios';

export const addToCart = async (userId: string, productId: string, quantity: number) => {
  const response = await axios.post(`/api/cart/${productId}`, { quantity });
  return response.data;
};

export const updateCart = async (userId: string, productId: string, quantity: number) => {
  const response = await axios.patch(`/api/cart/${productId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (userId: string, productId: string) => {
  const response = await axios.delete(`/api/cart/${productId}`);
  return response.data;
};

export const fetchCart = async (userId: string) => {
  const response = await axios.get(`/api/cart`);
  return response.data;
};