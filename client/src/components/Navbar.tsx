import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material';
import { styled } from '@mui/system';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CartIcon from './CartIcon';

interface NavbarProps {
  onLoginClick: () => void;
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  flexGrow: 1,
}));

const Title = styled(Typography)({
  flexGrow: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  '&:hover': {
    cursor: 'pointer',
  },
});

const AccountButton = styled(IconButton)(({ theme }) => ({
  marginLeft: 'auto',
  [theme.breakpoints.down('sm')]: {
    marginRight: '-12px',
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
  },
}));

const LogoutButton = styled(Button)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
  },
}));

const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogin = () => {
    onLoginClick();
  };

  const handleLogout = () => {
    logout();
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <div>
      <StyledAppBar position="static">
        <Toolbar>
          <Title variant="h6" onClick={() => navigate('/')}>
            My Typescript E-commerce Site
          </Title>
          <AccountButton
            edge="end"
            color="inherit"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={() => navigate('/users/me')}
          >
            <AccountCircleIcon />
          </AccountButton>
          {!isAuthenticated ? (
            <LoginButton color="inherit" onClick={handleLogin}>
              Login
            </LoginButton>
          ) : (
            <LogoutButton color="inherit" onClick={handleLogout}>
              Logout
            </LogoutButton>
          )}
          {isAuthenticated ? (
            <>
              <CartIcon onClick={handleCartClick} />
              {/* ...other authenticated user actions... */}
            </>
          ) : null}
        </Toolbar>
      </StyledAppBar>
    </div>
  );
};

export default Navbar;
