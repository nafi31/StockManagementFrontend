'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  Button,
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
  id: number;
  clientName: string;
  debtAmount: number;
}

interface Product {
  id: number;
  productName: string;
  productInStock: number;
  dateCreated: string;
  dateUpdated: string;
}

interface Invoice {
  id: number;
  date: string;
  amountInKg: number;
  pricePerItem: number;
  totalPrice: number;
  remark: string;
  client: Client;
  product: Product;
}

const url = `${process.env.NEXT_PUBLIC_WEB_URL}/invoice`;

const InvoiceListPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('date');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchInvoicesData = async () => {
    try {
      const token = localStorage.getItem('jwtToken'); // Get the token from local storage

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.data) {
        throw new Error('Failed to fetch invoices data');
      }
      setInvoices(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoicesData();
  }, []);

  const handleDeleteInvoice = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this invoice?');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('jwtToken');
      await axios.delete(`${url}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
      toast.success('Invoice deleted successfully!', {
        position: 'bottom-center',
        autoClose: 2000,
      });
    } catch (error) {
        toast.error('Failed to delete the invoice.', {
            position: 'bottom-center',
            autoClose: 2000,
          });
    }
  };

  const sortedAndFilteredInvoices = useMemo(() => {
    let filteredInvoices = [...invoices];
    if (selectedClient) {
      filteredInvoices = filteredInvoices.filter(
        (invoice) => invoice.client?.id.toString() === selectedClient
      );
    }
    if (selectedDate) {
      filteredInvoices = filteredInvoices.filter(
        (invoice) => new Date(invoice.date).toDateString() === selectedDate.toDateString()
      );
    }

    return filteredInvoices.sort((a, b) => {
      if (sortOption === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortOption === 'clientName') {
        return (a.client?.clientName?.toLowerCase() || '').localeCompare(
          b.client?.clientName?.toLowerCase() || ''
        );
      }
      return 0;
    });
  }, [invoices, selectedClient, selectedDate, sortOption]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!invoices.length) return <Typography>No invoices available</Typography>;

  return (
    <PageContainer>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Invoice List
      </Typography>
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems="flex-start"
        gap={2}
        sx={{ marginBottom: 2 }}
      >
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <MenuItem value="date">Sort by Date</MenuItem>
            <MenuItem value="clientName">Sort by Client Name</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Filter by Client</InputLabel>
          <Select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
            <MenuItem value="">All Clients</MenuItem>
            {invoices.map((invoice) => (
              <MenuItem key={invoice.client.id} value={invoice.client.id.toString()}>
                {invoice.client.clientName}
              </MenuItem>
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
        {sortedAndFilteredInvoices.map((invoice: Invoice) => (
          <Paper key={invoice.id} sx={{ marginBottom: 2, padding: 2 }}>
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems="flex-start"
              gap={2}
              sx={{ marginBottom: 2 }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1">Client: {invoice.client.clientName}</Typography>
                <Typography variant="body1">Product: {invoice.product.productName}</Typography>
                <Typography variant="body1">Amount: {invoice.amountInKg} kg</Typography>
                <Typography variant="body1">
                  Date: {new Date(invoice.date).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'right' }}>
                <Typography variant="body1">Price Per Item: {invoice.pricePerItem} Birr</Typography>
                <Typography variant="body1">Total Price: {invoice.totalPrice} Birr</Typography>
              </Box>
            </Box>
            <Typography variant="body2">Remarks: {invoice.remark || 'No remarks'}</Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleDeleteInvoice(invoice.id)}
              sx={{ marginTop: 2 }}
            >
              Delete Invoice
            </Button>
          </Paper>
        ))}
      </Box>
    </PageContainer>
  );
};

export default InvoiceListPage;
