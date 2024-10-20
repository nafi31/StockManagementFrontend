'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Grid, TextField, MenuItem, Button, Snackbar, Alert, Typography, CardContent } from '@mui/material';
// components
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import BlankCard from '@/app/(DashboardLayout)/components/shared/BlankCard';

// Define interfaces for Product and ShiftManager
interface Product {
  id: number;
  productName: string;
}

interface ShiftManager {
  id: number;
  shiftManager: string;
}

// Snackbar interface to handle its state
interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

const DailyProductionForm = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [shiftManagers, setShiftManagers] = useState<ShiftManager[]>([]);
  const [formData, setFormData] = useState({
    product: '',
    shiftManager: '',
    amountMadeToday: '',
  });
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });
  
  const router = useRouter(); // Initialize useRouter
  const url = process.env.NEXT_PUBLIC_WEB_URL;

  // Fetch products
  const fetchProducts = async () => {
    const token = localStorage.getItem('jwtToken'); // Retrieve token
    try {
      const response = await fetch(`${url}/product/`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add Bearer token
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error fetching products', severity: 'error' });
    }
  };

  // Fetch shift managers
  const fetchShiftManagers = async () => {
    const token = localStorage.getItem('jwtToken'); // Retrieve token
    try {
      const response = await fetch(`${url}/shiftmanager/`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add Bearer token
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch shift managers');
      }
      const data = await response.json();
      setShiftManagers(data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error fetching shift managers', severity: 'error' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchProducts();
      await fetchShiftManagers();
    };
    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { product, shiftManager, amountMadeToday } = formData;

    if (!product || !shiftManager || !amountMadeToday) {
      setSnackbar({ open: true, message: 'Please fill in all fields', severity: 'error' });
      return;
    }

    const token = localStorage.getItem('jwtToken'); // Retrieve token for submission
    try {
      const response = await fetch(`${url}/product-daily/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Add Bearer token
        },
        body: JSON.stringify({
          productId: product,
          shiftManagerId: shiftManager,
          amountDaily: Number(amountMadeToday),
        }),
      });

      if (!response.ok) throw new Error('Failed to submit the form');

      setSnackbar({ open: true, message: 'Form submitted successfully!', severity: 'success' });
      setFormData({ product: '', shiftManager: '', amountMadeToday: '' });

      // Redirect after successful submission
      router.push('http://localhost:3000/utilities/all-daily'); // Add redirect here
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to submit the form', severity: 'error' });
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <PageContainer title="Daily Production Entry" description="Submit today's production details">
      <Grid container justifyContent="center" className="mt-8">
        <Grid item xs={12} sm={8} md={6}>
          <BlankCard>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Daily Production Form
              </Typography>
              <form onSubmit={handleSubmit}>
                {/* Product Dropdown */}
                <TextField
                  select
                  label="Product"
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.productName}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Shift Manager Dropdown */}
                <TextField
                  select
                  label="Shift Manager"
                  name="shiftManager"
                  value={formData.shiftManager}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                >
                  {shiftManagers.map((manager) => (
                    <MenuItem key={manager.id} value={manager.id}>
                      {manager.shiftManager}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Amount Made Today */}
                <TextField
                  label="Amount Made Today"
                  name="amountMadeToday"
                  value={formData.amountMadeToday}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  type="number"
                />

                {/* Submit Button */}
                <Button variant="contained" color="primary" type="submit" fullWidth>
                  Submit
                </Button>
              </form>
            </CardContent>
          </BlankCard>
        </Grid>
      </Grid>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Center the Snackbar
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default DailyProductionForm;
