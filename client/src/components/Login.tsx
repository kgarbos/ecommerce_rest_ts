// src/components/Login.tsx
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  open: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

const Login: React.FC<LoginProps> = ({ open, onClose, onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        login(data.token);
        onClose();
      } else {
        alert('Login failed. Please check your email and password and try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleRegister = () => {
    onClose();
    onRegisterClick();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Login or Register</DialogTitle>
      <DialogContent>
        <Typography variant="body1">Please enter your email and password to login:</Typography>
        <TextField label="Email" type="email" value={email} onChange={handleEmailChange} fullWidth margin="normal" />
        <TextField label="Password" type="password" value={password} onChange={handlePasswordChange} fullWidth margin="normal" />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Login
        </Button>
        <Button variant="contained" onClick={handleRegister}>
          Register
        </Button>
        <Button variant="contained" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Login;