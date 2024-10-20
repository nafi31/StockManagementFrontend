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
  id: number;
  clientName: string;
}

interface Product {
  id: number;
  productName: string;
}

interface InvoiceFormData {
  clientId: number;
  productId: number;
  amountInKg: number;
  pricePerItem: number;
  totalPrice: number;
  remark: string;
}

const InvoiceForm = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<InvoiceFormData>({
    clientId: 0,
    productId: 0,
    amountInKg: 0,
    pricePerItem: 0,
    totalPrice: 0,
    remark: '',
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
            clientId: data[0].id,
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
            productId: data[0].id,
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

    // Update totalPrice dynamically
    if (name === 'amountInKg' || name === 'pricePerItem') {
      setFormData((prevData) => ({
        ...prevData,
        totalPrice: Number(prevData.amountInKg) * Number(prevData.pricePerItem),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      setSnackbar({ open: true, message: 'Token not found', severity: 'error' });
      return;
    }

    try {
      await axios.post(`${url}/invoice`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSnackbar({ open: true, message: 'Invoice submitted successfully!', severity: 'success' });
      setTimeout(() => {
        router.push('/utilities/list-all-invoices');
      }, 2000);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Error submitting invoice. Please try again.';
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
    <PageContainer title="Create Invoice" description="Submit a new invoice">
      <Grid container justifyContent="center" className="mt-8">
        <Grid item xs={12} sm={8} md={6}>
          <BlankCard>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Create Invoice
              </Typography>
              <form onSubmit={handleSubmit}>
                {/* Client Dropdown */}
                <TextField
                  select
                  label="Client"
                  name="clientId"
                  value={formData.clientId || clients[0]?.id}
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
                  name="productId"
                  value={formData.productId || products[0]?.id}
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
                  label="Amount in Kg"
                  name="amountInKg"
                  value={formData.amountInKg}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  type="number"
                />

                <TextField
                  label="Price per Item"
                  name="pricePerItem"
                  value={formData.pricePerItem}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  type="number"
                />

                <TextField
                  label="Total Price"
                  name="totalPrice"
                  value={formData.totalPrice}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  type="number"
                  InputProps={{
                    readOnly: true,
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

                {/* Submit Button */}
                <Button variant="contained" color="primary" type="submit" fullWidth>
                  Submit Invoice
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

export default InvoiceForm;
