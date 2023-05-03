import React, { useEffect, useState } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { CartItem, Product } from '../interfaces';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // Import the useAuth hook

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;

      try {
        const { data } = await axios.get('/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data && data.cart) {
          const fetchedCartItems: CartItem[] = data.cart.map((item: any) => {
            const cartItem: CartItem = {
              _id: item._id,
              productId: item.product._id,
              product: item.product,
              quantity: item.quantity,
            };
            return cartItem;
          });
          setCartItems(fetchedCartItems);
        }
      } catch (error) {
        // console.error(error);
      }
    };

    fetchCart();
  }, [token]);

  const updateCartBackend = async (itemId: string, quantity: number) => {
    if (!token) return;
  
    try {
      const { data } = await axios.patch(`/api/cart/${itemId}`, { quantity }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Update cart response:', data); // Log the response data
    } catch (error) {
      console.error('Update cart error:', error); // Log the error
    }
  };
  
  const removeFromCartBackend = async (itemId: string) => {
    if (!token) return;
  
    try {
      const { data } = await axios.delete(`/api/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Remove item response:', data); // Log the response data
    } catch (error) {
      console.error('Remove item error:', error); // Log the error
    }
  };

  const handleItemQuantityChange = async (itemId: string, quantity: number) => {
    const updatedItems = cartItems.map(item => item._id === itemId ? { ...item, quantity } : item);
    setCartItems(updatedItems);
    updateCartBackend(itemId, quantity); // Call updateCartBackend with itemId and quantity
  };
  
  const handleRemoveItem = (itemId: string) => {
    const updatedItems = cartItems.filter(item => item._id !== itemId);
    setCartItems(updatedItems);
    removeFromCartBackend(itemId); // Call removeFromCartBackend with itemId
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Your Cart</Typography>
      {cartItems.length === 0 ? (
        <Typography variant="h6">Your cart is empty.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cartItems.map((item) => (
                <TableRow key={item._id}>
                  <TableCell component="th" scope="row">
                    {item.product.name}
                  </TableCell>
                  <TableCell align="right">${item.product.price.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemQuantityChange(item._id, parseInt(e.target.value))}
                    />
                  </TableCell>
                  <TableCell align="right">${(item.product.price * item.quantity).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <button onClick={() => handleRemoveItem(item._id)}>Remove</button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell align="right">
                  ${cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0).toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default Cart;