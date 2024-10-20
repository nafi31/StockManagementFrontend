'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Grid, TextField, Button, Snackbar, Alert, Typography, CardContent } from '@mui/material';
// components
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import BlankCard from '@/app/(DashboardLayout)/components/shared/BlankCard';

// Define types for form data and snackbar state
interface FormData {
  productName: string;
  productInStock: number;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

const url = process.env.NEXT_PUBLIC_WEB_URL;

const DailyProductionForm = () => {
  const [formData, setFormData] = useState<FormData>({
    productName: '',
    productInStock: 0,
  });
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });
  const router = useRouter(); // Initialize useRouter

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { productName, productInStock } = formData;

    if (!productName || productInStock < 0) { // Ensure productInStock is non-negative
      setSnackbar({ open: true, message: 'Please fill in all fields correctly', severity: 'error' });
      return;
    }

    const token = localStorage.getItem('jwtToken'); // Retrieve token for submission
    try {
      const response = await fetch(`${url}/product/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Add Bearer token
        },
        body: JSON.stringify({
          productName, // Send productName directly
          productInStock, // Send productInStock directly
        }),
      });

      if (!response.ok) throw new Error('Failed to submit the form');

      setSnackbar({ open: true, message: 'Form submitted successfully!', severity: 'success' });
      setFormData({ productName: '', productInStock: 0 }); // Reset form data

      // Redirect after successful submission
      router.push('http://localhost:3000/utilities/list-products');
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to submit the form', severity: 'error' });
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'productInStock' ? Number(value) : value, // Convert productInStock to number
    }));
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
                {/* Product Name */}
                <TextField
                  label="Product Name"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  required
                />

                {/* Product In Stock */}
                <TextField
                  label="Product In Stock"
                  name="productInStock"
                  value={formData.productInStock}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  type="number"
                  inputProps={{ min: 0 }} // Prevent negative input
                  required
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
