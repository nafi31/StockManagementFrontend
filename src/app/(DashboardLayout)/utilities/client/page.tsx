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
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { AlertColor } from '@mui/material';

interface Client {
  id: number;
  clientName: string;
  debtAmount: number;
}

const url = process.env.NEXT_PUBLIC_WEB_URL;

const ClientList = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [newClientName, setNewClientName] = useState<string>('');
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [debtAmount, setDebtAmount] = useState<number | null>(null);

  const fetchClients = async () => {
    const token = localStorage.getItem('jwtToken');
    try {
      const response = await fetch(url + '/client/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      setClients(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error fetching clients',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  const handleAddClient = async () => {
    if (!newClientName.trim()) return;

    const token = localStorage.getItem('jwtToken');
    try {
      const response = await fetch(url + '/client/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clientName: newClientName, debtAmount: 0 }),
      });

      if (!response.ok) {
        throw new Error('Failed to add client');
      }

      setNewClientName('');
      fetchClients();
      setSnackbar({
        open: true,
        message: 'Client added successfully!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to add client',
        severity: 'error',
      });
    }
  };

  const handleEdit = (client: Client) => {
    setEditClient(client);
    setDebtAmount(client.debtAmount);
  };

  const handleSave = async () => {
    if (editClient) {
      const token = localStorage.getItem('jwtToken');
      try {
        const response = await fetch(`${url}/client/${editClient.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clientName: editClient.clientName,
            debtAmount: debtAmount,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to update client: ${errorData.message || 'Unknown error'}`);
        }

        setSnackbar({
          open: true,
          message: 'Client updated successfully!',
          severity: 'success',
        });
        setEditClient(null);
        setDebtAmount(null);
        fetchClients();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update client';
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      }
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('jwtToken');
    try {
      const response = await fetch(`${url}/client/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      setClients((prevClients) => prevClients.filter(client => client.id !== id));
      setSnackbar({
        open: true,
        message: 'Client deleted successfully!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete client',
        severity: 'error',
      });
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
    <Grid container justifyContent="center" className="mt-8">
      <Grid item xs={12} sm={12} md={10}>
        <Typography variant="h5" gutterBottom>
          Client List
        </Typography>

        <TextField
          label="Client Name"
          variant="outlined"
          fullWidth
          value={newClientName}
          onChange={(e) => setNewClientName(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleAddClient} className="mt-2">
          Add Client
        </Button>

        <TableContainer component={Paper} className="mt-4">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client Name</TableCell>
                <TableCell>Debt Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.length > 0 ? (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      {editClient?.id === client.id ? (
                        <TextField
                          value={editClient.clientName}
                          onChange={(e) => setEditClient({ ...editClient, clientName: e.target.value })}
                        />
                      ) : (
                        client.clientName
                      )}
                    </TableCell>
                    <TableCell>
                      {editClient?.id === client.id ? (
                        <TextField
                          type="number"
                          value={debtAmount || ''}
                          onChange={(e) => setDebtAmount(Number(e.target.value))}
                        />
                      ) : (
                        client.debtAmount
                      )}
                    </TableCell>
                    <TableCell>
                      {editClient?.id === client.id ? (
                        <Button variant="contained" color="primary" onClick={handleSave}>
                          Save
                        </Button>
                      ) : (
                        <Button variant="contained" color="primary" onClick={() => handleEdit(client)}>
                          Edit
                        </Button>
                      )}
                      <Button variant="contained" color="error" onClick={() => openDeleteDialog(client.id)}>
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
              Are you sure you want to delete this client? This action cannot be undone.
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
      </Grid>
    </Grid>
  );
};

export default ClientList;