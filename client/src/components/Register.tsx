import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, Button } from '@mui/material';

interface RegisterProps {
  open: boolean;
  onClose: () => void;
}

const Register: React.FC<RegisterProps> = ({ open, onClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleRegister = () => {
    fetch('/api/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    })
    .then(response => {
      if (response.ok) {
        // Registration successful, close the dialog
        onClose();
      } else {
        // Registration failed, display error message
        alert('Registration failed. Please check your email and password and try again.');
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Register</DialogTitle>
      <DialogContent>
        <Typography variant="body1">Please enter your username, email, and password to register:</Typography>
        <TextField label="Username" value={username} onChange={handleUsernameChange} fullWidth margin="normal" />
        <TextField label="Email" type="email" value={email} onChange={handleEmailChange} fullWidth margin="normal" />
        <TextField label="Password" type="password" value={password} onChange={handlePasswordChange} fullWidth margin="normal" />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={handleRegister}>
          Register
        </Button>
        <Button variant="contained" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Register;