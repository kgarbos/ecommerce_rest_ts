import React, { useState, useEffect } from 'react';
import { IconButton, Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface CartIconProps {
  onClick: () => void;
}

const CartIcon: React.FC<CartIconProps> = ({ onClick }) => {
  const [cartItemCount, setCartItemCount] = useState(0);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return; 

      try {
        const { data } = await axios.get('/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data && data.items) { 
          setCartItemCount(data.items.length);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchCart();
  }, [token]); 

  return (
    <IconButton edge="end" color="inherit" onClick={onClick}>
      <Badge badgeContent={cartItemCount} color="secondary">
        <ShoppingCartIcon />
      </Badge>
    </IconButton>
  );
};

export default CartIcon;