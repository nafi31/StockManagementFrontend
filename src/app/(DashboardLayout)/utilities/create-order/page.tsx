'use client';

import { useEffect, useState } from 'react';
import {
  Typography,
  Grid,
  CardContent,
  TextField,
  MenuItem,
  Button,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  AlertColor,
} from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import BlankCard from '@/app/(DashboardLayout)/components/shared/BlankCard';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const url = process.env.NEXT_PUBLIC_WEB_URL;

interface Client {
  id: number; // Change to number
  clientName: string;
}

interface Product {
  id: number; // Change to number
  productName: string;
}

interface OrderFormData {
  clientId: number; // Change to number
  productId: number; // Change to number
  amountInBag: number;
  amountInKg: number;
  pricePerBag: number;
  priceInTotal: number;
  remark: string;
  paid: boolean;
}

const OrderForm = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<OrderFormData>({
    clientId: 0, // Set initial value to 0
    productId: 0, // Set initial value to 0
    amountInBag: 100,
    amountInKg: 40,
    pricePerBag: 2000,
    priceInTotal: 250000,
    remark: '50 % paid',
    paid: false,
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const router = useRouter();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) throw new Error('Token not found');
        const { data } = await axios.get(`${url}/client`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClients(data);
        if (data.length > 0) {
          setFormData((prevData) => ({
            ...prevData,
            clientId: data[0].id, // Set the first client as default
          }));
        }
      } catch (error) {
        setSnackbar({ open: true, message: 'Error fetching clients.', severity: 'error' });
      }
    };

    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) throw new Error('Token not found');
        const { data } = await axios.get(`${url}/product`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(data);
        if (data.length > 0) {
          setFormData((prevData) => ({
            ...prevData,
            productId: data[0].id, // Set the first product as default
          }));
        }
      } catch (error) {
        setSnackbar({ open: true, message: 'Error fetching products.', severity: 'error' });
      }
    };

    fetchClients();
    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string | undefined; value: unknown; }>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name as string]: value,
    }));

    // Update priceInTotal dynamically
    if (name === 'amountInBag' || name === 'pricePerBag') {
      setFormData((prevData) => ({
        ...prevData,
        priceInTotal: Number(prevData.amountInBag) * Number(prevData.pricePerBag),
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      paid: e.target.checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      setSnackbar({ open: true, message: 'Token not found', severity: 'error' });
      return;
    }

    try {
      await axios.post(`${url}/order`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSnackbar({ open: true, message: 'Order submitted successfully!', severity: 'success' });
      setTimeout(() => {
        router.push('/utilities/list-all-orders');
      }, 2000);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Error submitting order. Please try again.';
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      } else {
        setSnackbar({ open: true, message: 'An unexpected error occurred.', severity: 'error' });
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prevSnackbar) => ({ ...prevSnackbar, open: false }));
  };

  return (
    <PageContainer title="Create Order" description="Submit a new order">
      <Grid container justifyContent="center" className="mt-8">
        <Grid item xs={12} sm={8} md={6}>
          <BlankCard>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Create Order
              </Typography>
              <form onSubmit={handleSubmit}>
                {/* Client Dropdown */}
                <TextField
                      select
                      label="Client"
                      name="clientId"
                      value={formData.clientId || clients[0]?.id} // Default to the first client if clientId is not set
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                                        >
                      {clients.map((client) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.clientName}
                        </MenuItem>
                      ))}
                    </TextField>
                {/* Product Dropdown */}
                <TextField
                  select
                  label="Product"
                  name="productId" // Updated name to match state
                  value={formData.productId || products[0]?.id}// Ensure this is a number
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

                {/* Other fields */}
                <TextField
                  label="Amount in Bag"
                  name="amountInBag"
                  value={formData.amountInBag}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  type="number"
                />

                <TextField
                  label="Amount in Kg"
                  name="amountInKg"
                  value={formData.amountInKg}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  type="number"
                />

                <TextField
                  label="Price per Bag"
                  name="pricePerBag"
                  value={formData.pricePerBag}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  type="number"
                />

                <TextField
                  label="Price in Total"
                  name="priceInTotal"
                  value={formData.priceInTotal}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  type="number"
                  InputProps={{
                    readOnly: true, // Make this field read-only
                  }}
                />

                <TextField
                  label="Remark"
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />

                {/* Paid Checkbox */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.paid}
                      onChange={handleCheckboxChange}
                      name="paid"
                      color="primary"
                    />
                  }
                  label="Paid"
                />

                {/* Submit Button */}
                <Button variant="contained" color="primary" type="submit" fullWidth>
                  Submit Order
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
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default OrderForm;
