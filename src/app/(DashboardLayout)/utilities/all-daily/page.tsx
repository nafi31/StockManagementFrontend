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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Container,
} from '@mui/material';
import axios from 'axios';
import { AlertColor } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

const url = process.env.NEXT_PUBLIC_WEB_URL;

interface ProductDaily {
  id: number;
  amountDaily: number;
  date: string;
  product: {
    id: number;
    productName: string;
  };
  shiftManager: {
    id: number;
    shiftManager: string;
  };
}

const PageContainer: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => {
  return (
    <Container>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </Container>
  );
};

const ProductDailyList = () => {
  const [productDailyData, setProductDailyData] = useState<ProductDaily[]>([]);
  const [filteredData, setFilteredData] = useState<ProductDaily[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'success' });
  const [selectedShiftManager, setSelectedShiftManager] = useState<string>('All');
  const [timeFrame, setTimeFrame] = useState<string>('All');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchProductDailyData();
  }, []);

  const fetchProductDailyData = async () => {
    const token = localStorage.getItem('jwtToken');
    try {
      const response = await axios.get<ProductDaily[]>(`${url}/product-daily/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const sortedData = response.data.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setProductDailyData(sortedData);
      setFilteredData(sortedData);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error fetching product daily data', severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  const handleShiftManagerChange = (event: SelectChangeEvent<string>) => {
    const selected = event.target.value as string;
    setSelectedShiftManager(selected);
    filterData(selected, timeFrame);
  };

  const handleTimeFrameChange = (event: SelectChangeEvent<string>) => {
    const selected = event.target.value as string;
    setTimeFrame(selected);
    filterData(selectedShiftManager, selected);
  };

  const filterData = (shiftManager: string, timeFrame: string) => {
    let filtered = productDailyData;

    if (shiftManager !== 'All') {
      filtered = filtered.filter(item => item.shiftManager.shiftManager === shiftManager);
    }

    const now = new Date();
    if (timeFrame === 'Past Day') {
      filtered = filtered.filter(item => new Date(item.date) >= new Date(now.getTime() - 24 * 60 * 60 * 1000));
    } else if (timeFrame === 'Past Week') {
      filtered = filtered.filter(item => new Date(item.date) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else if (timeFrame === 'Past 30 Days') {
      filtered = filtered.filter(item => new Date(item.date) >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
    }

    setFilteredData(filtered);
  };

  const uniqueShiftManagers = Array.from(new Set(productDailyData.map(item => item.shiftManager.shiftManager)));

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${url}/product-daily/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete the entry');
      }

      setProductDailyData(prevData => prevData.filter(item => item.id !== id));
      setFilteredData(prevData => prevData.filter(item => item.id !== id));
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

  return (
    <PageContainer title="Product Daily List" description="List of all daily product entries">
      <Grid container justifyContent="center" className="mt-8">
        <Grid item xs={12} sm={12} md={10}>
          <Typography variant="h5" gutterBottom>
            Daily Production Records
          </Typography>

          <Grid container spacing={2} className="mb-4">
            <Grid item xs={6} sm={6} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="shift-manager-label">Shift Manager</InputLabel>
                <Select
                  labelId="shift-manager-label"
                  value={selectedShiftManager}
                  onChange={handleShiftManagerChange}
                  label="Shift Manager"
                >
                  <MenuItem value="All">All</MenuItem>
                  {uniqueShiftManagers.map((manager) => (
                    <MenuItem key={manager} value={manager}>
                      {manager}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={6} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="time-frame-label">Time Frame</InputLabel>
                <Select
                  labelId="time-frame-label"
                  value={timeFrame}
                  onChange={handleTimeFrameChange}
                  label="Time Frame"
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Past Day">Past Day</MenuItem>
                  <MenuItem value="Past Week">Past Week</MenuItem>
                  <MenuItem value="Past 30 Days">Past 30 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Shift Manager</TableCell>
                  <TableCell>Amount Daily</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.product.productName}</TableCell>
                      <TableCell>{row.shiftManager.shiftManager}</TableCell>
                      <TableCell>{row.amountDaily}</TableCell>
                      <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                      <TableCell>
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
                    <TableCell colSpan={5} align="center">
                      No records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={openDialog} onClose={cancelDelete}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this entry?
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