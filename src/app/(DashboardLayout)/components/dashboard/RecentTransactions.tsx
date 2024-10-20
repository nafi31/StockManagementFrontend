import { useState, useEffect } from 'react';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  timelineOppositeContentClasses,
} from '@mui/lab';
import { Link, Typography, Box } from '@mui/material';
import axios from 'axios';

interface Client {
  clientName: string;
}

interface Order {
  id: number;
  date: string;
  paid: boolean;
  client: Client;
  amountInBag: number;
  amountInKg: number;
  priceInTotal: number;
  remark: string;
}

const url = process.env.NEXT_PUBLIC_WEB_URL;

const RecentTransactions = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');

    // Fetch orders only if the token exists
    if (token) {
      const fetchOrders = async () => {
        try {
          const response = await axios.get<Order[]>(`${url}/order`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const sortedOrders = response.data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setOrders(sortedOrders);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      };

      fetchOrders();
    }
  }, []); // Add token to dependencies if you want to refetch when it changes

  return (
    <DashboardCard title="Recent Transactions">
      <Box
        sx={{
          maxHeight: '400px',
          overflowY: 'auto',
          pr: { xs: 1, sm: 2 }, // Responsive padding
        }}
      >
        <Timeline
          className="theme-timeline"
          sx={{
            p: 0,
            mb: '-40px',
            '& .MuiTimelineConnector-root': {
              width: '1px',
              backgroundColor: '#efefef',
            },
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: { xs: 0, sm: 0.5 }, // Responsive flex basis
              paddingLeft: { xs: 0, sm: 2 },
              paddingRight: { xs: 2, sm: 0 },
            },
          }}
        >
          {orders.map((order) => (
            <TimelineItem key={order.id} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
              <TimelineOppositeContent
                sx={{
                  typography: { xs: 'caption', sm: 'body2' }, // Responsive typography
                }}
              >
                {new Date(order.date).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color={order.paid ? 'success' : 'error'} variant="outlined" />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography fontWeight="600" variant="h6" sx={{ display: { xs: 'subtitle2', sm: 'h6' } }}>
                  Order from {order.client.clientName}
                </Typography>
                <Typography variant="body2">
                  {order.amountInBag} bags ({order.amountInKg} kg) - ${order.priceInTotal}
                </Typography>
                <Typography variant="caption">Remark: {order.remark}</Typography>
                
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>
    </DashboardCard>
  );
};

export default RecentTransactions;
