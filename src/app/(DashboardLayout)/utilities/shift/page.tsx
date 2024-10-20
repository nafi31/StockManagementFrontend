'use client';
import axios from 'axios';
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
import { AlertColor } from '@mui/material/Alert';

const url = process.env.NEXT_PUBLIC_WEB_URL;

interface ShiftManager {
  id: number;
  shiftManager: string;
}

const ClientList = () => {
  const [shiftManagers, setShiftManagers] = useState<ShiftManager[]>([]);
  const [newShiftManager, setNewShiftManager] = useState<string>('');
  const [editShiftManager, setEditShiftManager] = useState<ShiftManager | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: AlertColor }>({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Fetch shift manager data
  const fetchShiftManagers = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.get(`${url}/shiftmanager/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShiftManagers(response.data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error fetching shift managers', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchShiftManagers();
  }, []);

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  // Handle adding a new shift manager
  const handleAddShiftManager = async () => {
    if (!newShiftManager.trim()) return;

    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.post(`${url}/shiftmanager/`, 
        { shiftManager: newShiftManager }, 
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      setNewShiftManager('');
      fetchShiftManagers(); // Refresh shift manager list
      setSnackbar({ open: true, message: 'Shift manager added successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to add shift manager', severity: 'error' });
    }
  };

  // Handle editing a shift manager
  const handleEdit = (shiftManager: ShiftManager) => {
    setEditShiftManager(shiftManager);
  };

  // Handle saving edits to a shift manager
  const handleSave = async () => {
    if (editShiftManager) {
      try {
        const token = localStorage.getItem('jwtToken');
        const response = await axios.patch(`${url}/shiftmanager/${editShiftManager.id}`, 
          { shiftManager: editShiftManager.shiftManager },
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );

        setSnackbar({ open: true, message: 'Shift manager updated successfully!', severity: 'success' });
        setEditShiftManager(null);
        fetchShiftManagers(); // Refresh shift manager list
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to update shift manager', severity: 'error' });
      }
    }
  };

  // Handle deleting a shift manager
  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.delete(`${url}/shiftmanager/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShiftManagers((prevShiftManagers) => prevShiftManagers.filter(manager => manager.id !== id));
      setSnackbar({ open: true, message: 'Shift manager deleted successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete shift manager', severity: 'error' });
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (id: number) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  // Handle confirmation to delete
  const confirmDelete = () => {
    if (deleteId !== null) {
      handleDelete(deleteId);
    }
    setOpenDialog(false);
    setDeleteId(null);
  };

  // Handle cancel delete
  const cancelDelete = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  return (
    <Grid container justifyContent="center" className="mt-8">
      <Grid item xs={12} sm={12} md={10}>
        <Typography variant="h5" gutterBottom>
          Shift Manager List
        </Typography>

        {/* Input for adding a new shift manager */}
        <TextField
          label="Shift Manager Name"
          variant="outlined"
          fullWidth
          value={newShiftManager}
          onChange={(e) => setNewShiftManager(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleAddShiftManager} className="mt-2">
          Add Shift Manager
        </Button>

        {/* Table for displaying shift managers */}
        <TableContainer component={Paper} className="mt-4">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Shift Manager Name</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shiftManagers.length > 0 ? (
                shiftManagers.map((manager) => (
                  <TableRow key={manager.id}>
                    <TableCell>
                      {editShiftManager?.id === manager.id ? (
                        <TextField
                          value={editShiftManager.shiftManager}
                          onChange={(e) => setEditShiftManager({ ...editShiftManager, shiftManager: e.target.value })}
                        />
                      ) : (
                        manager.shiftManager
                      )}
                    </TableCell>
                    <TableCell>
                      {editShiftManager?.id === manager.id ? (
                        <Button variant="contained" color="primary" onClick={handleSave}>
                          Save
                        </Button>
                      ) : (
                        <Button variant="contained" color="primary" onClick={() => handleEdit(manager)}>
                          Edit
                        </Button>
                      )}
                      <Button variant="contained" color="error" onClick={() => openDeleteDialog(manager.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Snackbar for feedback */}
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

        {/* Confirmation Dialog for Delete */}
        <Dialog open={openDialog} onClose={cancelDelete}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this shift manager? This action cannot be undone.
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
