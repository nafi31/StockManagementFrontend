import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useMediaQuery,
  Theme } from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import axios from 'axios';

interface Product {
  id: number;
  productInStock: number;
  productName: string;
  dateCreated: string;
  dateUpdated: string;
}

const url = process.env.NEXT_PUBLIC_WEB_URL;

const ProductPerformance = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm')); // Type assertion for theme

  useEffect(() => {
    const storedToken = localStorage.getItem('jwtToken');
    setToken(storedToken);

    const fetchProducts = async () => {
      if (!storedToken) return;

      try {
        const response = await axios.get(`${url}/product`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [url]);

  return (
    <DashboardCard title="Product">
      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        {isMobile ? (
          // Mobile View
          <Box>
            {products.length === 0 ? (
              <Typography>No products found.</Typography>
            ) : (
              products.map((product) => (
                <Box key={product.id} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Id: {product.id}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Product In Stock: {product.productInStock}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Product Name: {product.productName || 'N/A'}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Date Created: {new Date(product.dateCreated).toLocaleDateString()}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Date Updated: {new Date(product.dateUpdated).toLocaleDateString()}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        ) : (
          // Desktop View
          <Table
            aria-label="simple table"
            sx={{
              whiteSpace: 'nowrap',
              mt: 2,
              minWidth: { xs: '300px', sm: '600px' },
              '& td, & th': {
                fontSize: { xs: '14px', sm: '16px' },
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Id
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Product In Stock
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Product Name
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Date Created
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Date Updated
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography>No products found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: { xs: '14px', sm: '15px' },
                          fontWeight: '500',
                        }}
                      >
                        {product.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: { xs: '14px', sm: '15px' },
                          fontWeight: '500',
                        }}
                      >
                        {product.productInStock}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: { xs: '14px', sm: '15px' },
                          fontWeight: '500',
                        }}
                      >
                        {product.productName || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: { xs: '14px', sm: '15px' },
                          fontWeight: '500',
                        }}
                      >
                        {new Date(product.dateCreated).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: { xs: '14px', sm: '15px' },
                          fontWeight: '500',
                        }}
                      >
                        {new Date(product.dateUpdated).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Box>
    </DashboardCard>
  );
};

export default ProductPerformance;
