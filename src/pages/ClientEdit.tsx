import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
} from '@mui/material';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isActive: boolean;
}

const ClientEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof Client, string>>>({});

  useEffect(() => {
    // TODO: Fetch client data from API
    // For now, using mock data
    setClient({
      id: id || '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      isActive: true,
    });
    setLoading(false);
  }, [id]);

  const handleChange = (field: keyof Client) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (client) {
      setClient({ ...client, [field]: value });
      // Clear error when field is modified
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Client, string>> = {};

    if (!client?.name) {
      newErrors.name = 'Name is required';
    }

    if (!client?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(client.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!client?.phone) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // TODO: Save client changes to API
      navigate('/clients');
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!client) {
    return <Typography>Client not found</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Edit Client
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={client.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={client.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={client.phone}
                onChange={handleChange('phone')}
                error={!!errors.phone}
                helperText={errors.phone}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={client.address}
                onChange={handleChange('address')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                value={client.city}
                onChange={handleChange('city')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="State"
                value={client.state}
                onChange={handleChange('state')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={client.zipCode}
                onChange={handleChange('zipCode')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                value={client.country}
                onChange={handleChange('country')}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={client.isActive}
                    onChange={handleChange('isActive')}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/clients')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Save Changes
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ClientEdit; 