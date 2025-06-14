import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const Layout = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Invoice System
          </Typography>
          
          {/* Navigation Buttons */}
          <Button 
            color="inherit" 
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Home
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/invoices')}
            sx={{ mr: 2 }}
          >
            Invoices
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/customers')}
            sx={{ mr: 2 }}
          >
            Customers
          </Button>
        </Toolbar>
      </AppBar>
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 