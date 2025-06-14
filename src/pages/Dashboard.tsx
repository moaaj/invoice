import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { invoiceService } from '../services/invoiceService';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
  });

  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const invoices = await invoiceService.getInvoices();
        
        const totalAmount = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
        const pendingInvoices = invoices.filter(inv => inv.status === 'sent').length;
        const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;

        setStats({
          totalInvoices: invoices.length,
          totalAmount,
          pendingInvoices,
          overdueInvoices,
        });

        // Get recent invoices
        setRecentInvoices(invoices.slice(0, 5));
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ color, mr: 1 }}>{icon}</Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Invoices"
            value={stats.totalInvoices}
            icon={<ReceiptIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Amount"
            value={`$${stats.totalAmount.toFixed(2)}`}
            icon={<MoneyIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Invoices"
            value={stats.pendingInvoices}
            icon={<PeopleIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Overdue Invoices"
            value={stats.overdueInvoices}
            icon={<WarningIcon />}
            color="#d32f2f"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Invoices
            </Typography>
            <List>
              {recentInvoices.map((invoice, index) => (
                <React.Fragment key={invoice.id}>
                  <ListItem>
                    <ListItemText
                      primary={invoice.invoiceNumber}
                      secondary={`${invoice.customerName} - $${invoice.grandTotal.toFixed(2)}`}
                    />
                  </ListItem>
                  {index < recentInvoices.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <List>
              <ListItem button onClick={() => window.location.href = '/invoices/create'}>
                <ListItemText primary="Create New Invoice" />
              </ListItem>
              <Divider />
              <ListItem button onClick={() => window.location.href = '/clients/create'}>
                <ListItemText primary="Add New Client" />
              </ListItem>
              <Divider />
              <ListItem button onClick={() => window.location.href = '/invoices'}>
                <ListItemText primary="View All Invoices" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 