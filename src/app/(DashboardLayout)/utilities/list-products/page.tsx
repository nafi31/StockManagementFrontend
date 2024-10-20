'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Grid,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import axios from 'axios';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';

const url = process.env.NEXT_PUBLIC_WEB_URL;

interface Product {
  id: number;
  productName: string;
  productInStock: number;
}

const ProductDailyList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredData, setFilteredData] = useState<Product[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.get(`${url}/product`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(response.data);
      setFilteredData(response.data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error fetching product data', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.delete(`${url}/product/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts((prevData) => prevData.filter(item => item.id !== id));
      setFilteredData((prevData) => prevData.filter(item => item.id !== id));
      setSnackbar({ open: true, message: 'Entry deleted successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete the entry', severity: 'error' });
    }
  };

  const openDeleteDialog = (id: number) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      handleDelete(deleteId);
    }
    setOpenDialog(false);
    setDeleteId(null);
  };

  const cancelDelete = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
  };

  const handleSave = async () => {
    if (editProduct) {
      try {
        const token = localStorage.getItem('jwtToken');
        await axios.patch(`${url}/product/${editProduct.id}`, {
          productName: editProduct.productName,
          productInStock: editProduct.productInStock,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setSnackbar({ open: true, message: 'Product updated successfully!', severity: 'success' });
        setEditProduct(null);
        fetchProducts();
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to update the product', severity: 'error' });
      }
    }
  };

  return (
    <PageContainer title="Product List" description="List of all product entries">
      <Grid container justifyContent="center" className="mt-8">
        <Grid item xs={12} sm={12} md={10}>
          <Typography variant="h5" gutterBottom>
            Product List
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Product In Stock</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {editProduct?.id === row.id ? (
                          <TextField
                            value={editProduct.productName}
                            onChange={(e) =>
                              setEditProduct({ ...editProduct, productName: e.target.value })
                            }
                          />
                        ) : (
                          row.productName
                        )}
                      </TableCell>
                      <TableCell>
                        {editProduct?.id === row.id ? (
                          <TextField
                            type="number"
                            value={editProduct.productInStock}
                            onChange={(e) =>
                              setEditProduct({
                                ...editProduct,
                                productInStock: Number(e.target.value),
                              })
                            }
                          />
                        ) : (
                          row.productInStock
                        )}
                      </TableCell>
                      <TableCell>
                        {editProduct?.id === row.id ? (
                          <Button variant="contained" color="primary" onClick={handleSave}>
                            Save
                          </Button>
                        ) : (
                          <Button variant="contained" color="primary" onClick={() => handleEdit(row)}>
                            Edit
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => openDeleteDialog(row.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={openDialog} onClose={cancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this entry? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ProductDailyList;