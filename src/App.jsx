import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import InvoiceList from './pages/InvoiceList';
import InvoiceCreate from './pages/InvoiceCreate';
import InvoiceEdit from './pages/InvoiceEdit';
import CustomerList from './pages/CustomerList';
import CustomerCreate from './pages/CustomerCreate';
import CustomerEdit from './pages/CustomerEdit';
import BulkInvoiceUpload from './pages/BulkInvoiceUpload';
import { useAuth } from './context/AuthContext';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  console.log('App component rendered'); // Debug log

  return (
    <AuthProvider>
      <ThemeProvider>
        <SnackbarProvider maxSnack={3}>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/invoices" replace />} />
                <Route path="invoices" element={<InvoiceList />} />
                <Route path="invoices/create" element={<InvoiceCreate />} />
                <Route path="invoices/bulk-upload" element={<BulkInvoiceUpload />} />
                <Route path="invoices/:id/edit" element={<InvoiceEdit />} />
                <Route path="customers" element={<CustomerList />} />
                <Route path="customers/create" element={<CustomerCreate />} />
                <Route path="customers/:id/edit" element={<CustomerEdit />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App; 