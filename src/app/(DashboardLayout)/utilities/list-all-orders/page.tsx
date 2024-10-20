'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

interface Client {
  id: string;
  clientName: string;
}

interface Product {
  productName: string;
  productInStock: number;
  dateCreated: string;
  dateUpdated: string;
}

interface Order {
  id: string;
  client: Client;
  product: Product;
  amountInBag: number;
  amountInKg: number;
  date: string;
  pricePerBag: number;
  priceInTotal: number;
  remark: string;
  paid: boolean;
}

const url = process.env.NEXT_PUBLIC_WEB_URL;

const OrderListPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState({ orders: true, clients: true });
  const [error, setError] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('date');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [localPaidStatus, setLocalPaidStatus] = useState<{ [key: string]: boolean }>({});

  const fetchOrdersData = async (token: string) => {
    try {
      const response = await axios.get(`${url}/order`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.data) {
        throw new Error('Failed to fetch orders data');
      }
      const data: Order[] = response.data;
      setOrders(data);
      const initialPaidStatus = data.reduce((acc, order) => {
        acc[order.id] = order.paid;
        return acc;
      }, {} as { [key: string]: boolean });
      setLocalPaidStatus(initialPaidStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching orders.');
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  const fetchClientsData = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.get(`${url}/client`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.data) {
        throw new Error('Failed to fetch clients data');
      }
      const data: Client[] = response.data;
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching clients.');
    } finally {
      setLoading(prev => ({ ...prev, clients: false }));
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      fetchOrdersData(token);
    }
    fetchClientsData();
  }, []);

  const sortedAndFilteredOrders = useMemo(() => {
    let filteredOrders = [...orders];
    if (selectedClient) {
      filteredOrders = filteredOrders.filter(order => order.client?.id === selectedClient);
    }
    if (selectedDate) {
      filteredOrders = filteredOrders.filter(order => new Date(order.date).toDateString() === selectedDate.toDateString());
    }
    
    return filteredOrders.sort((a, b) => {
      if (sortOption === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortOption === 'unpaid') {
        return (a.paid === b.paid ? new Date(b.date).getTime() - new Date(a.date).getTime() : a.paid ? 1 : -1);
      } else if (sortOption === 'clientName') {
        return (a.client?.clientName?.toLowerCase() || '').localeCompare((b.client?.clientName?.toLowerCase() || ''));
      }
      return 0;
    });
  }, [orders, selectedClient, selectedDate, sortOption]);

  const handleSave = async (orderId: string) => {
    const confirmSave = window.confirm('Are you sure you want to save the changes?');
    if (confirmSave) {
      try {
        const token = localStorage.getItem('jwtToken')
        const updatedOrder = { paid: localPaidStatus[orderId] };
        const response = await axios.patch(`${url}/order/${orderId}`, updatedOrder, {
          headers: { 'Content-Type': 'application/json' ,Authorization: `Bearer ${token}` },
        });
        if (!response.data) {
          throw new Error('Failed to update order');
        }
        toast.success('Order updated successfully!');
        fetchOrdersData(localStorage.getItem('jwtToken')!); // Refresh orders
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'An error occurred while updating the order.');
      }
    }
  };

  const handleDelete = async (orderId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this order?');
    if (confirmDelete) {
      try {
        const response = await axios.delete(`${url}/order/${orderId}`);
        if (!response.data) {
          throw new Error('Failed to delete order');
        }
        toast.success('Order deleted successfully!');
        fetchOrdersData(localStorage.getItem('jwtToken')!); // Refresh orders
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'An error occurred while deleting the order.');
      }
    }
  };

  if (loading.orders) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!orders.length) return <Typography>No orders available</Typography>;

  return (
    <PageContainer>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>Order List</Typography>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="flex-start" gap={2} sx={{ marginBottom: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <MenuItem value="date">Sort by Date</MenuItem>
            <MenuItem value="unpaid">Sort by Unpaid Status</MenuItem>
            <MenuItem value="clientName">Sort by Client Name</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Filter by Client</InputLabel>
          <Select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
            <MenuItem value="">All Clients</MenuItem>
            {clients.map(client => (
              <MenuItem key={client.id} value={client.id}>{client.clientName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <DatePicker
              label="Filter by Date"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
            />
          </Box>
        </LocalizationProvider>
      </Box>

      <Box>
        {sortedAndFilteredOrders.map((order: Order) => (
          <Paper key={order.id} sx={{ marginBottom: 2, padding: 2 }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" gap={2} sx={{ marginBottom: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1">Client: {order.client?.clientName}</Typography>
                <Typography variant="body1">Product: {order.product?.productName}</Typography>
                <Typography variant="body1">Amount: {order.amountInBag} bags / {order.amountInKg} kg</Typography>
                <Typography variant="body1">Date: {new Date(order.date).toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'right' }}>
                <Typography variant="body1">Price Per Bag: {order.pricePerBag.toFixed(2)} Birr</Typography>
                <Typography variant="body1">Total Price: {order.priceInTotal.toFixed(2)} Birr</Typography>
                <FormControlLabel
                  control={<Checkbox checked={localPaidStatus[order.id]} onChange={(e) => setLocalPaidStatus({ ...localPaidStatus, [order.id]: e.target.checked })} />}
                  label="Paid"
                />
                <Button variant="contained" onClick={() => handleSave(order.id)}>Save</Button>
                <Button variant="outlined" onClick={() => handleDelete(order.id)}>Delete</Button>
              </Box>
            </Box>
            <Typography variant="body2">Remarks: {order.remark || 'No remarks'}</Typography>
          </Paper>
        ))}
      </Box>
    </PageContainer>
  );
};

export default OrderListPage;
