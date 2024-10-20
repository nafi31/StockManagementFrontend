import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import axios from "axios";
import { ApexOptions } from "apexcharts"; // Import ApexOptions
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Avatar, Fab } from '@mui/material';
import { IconArrowDownRight, IconCurrencyDollar } from '@tabler/icons-react';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

interface Order {
  pricePerBag: number;
  amountInBag: number;
}

interface Invoice {
  totalPrice: number;
}

const MonthlyEarnings = () => {
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const secondarylight = '#f5fcff';
  const errorlight = '#fdede8';

  const [monthlyProfits, setMonthlyProfits] = useState<number[]>([]);
  const [monthlyLosses, setMonthlyLosses] = useState<number[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [totalLosses, setTotalLosses] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_WEB_URL}`;
        const token = localStorage.getItem('jwtToken');

        const ordersResponse = await axios.get<Order[]>(`${url}/order`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const invoicesResponse = await axios.get<Invoice[]>(`${url}/invoice`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Calculate total profits from orders
        const profits = ordersResponse.data.map(order => 
          order.pricePerBag * order.amountInBag
        );

        const totalProfits = profits.reduce((acc, val) => acc + val, 0);
        setTotalEarnings(totalProfits);
        setMonthlyProfits(profits); // Set monthly profits data

        // Calculate total losses from invoices
        const losses = invoicesResponse.data.map(invoice => invoice.totalPrice);
        const totalLosses = losses.reduce((acc, val) => acc + val, 0);
        setTotalLosses(totalLosses);
        setMonthlyLosses(losses); // Set monthly losses data

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const optionscolumnchart: ApexOptions = { // Explicitly type as ApexOptions
    chart: {
      type: 'area', // 'area' is now correctly typed
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      height: 60,
      sparkline: {
        enabled: true,
      },
      group: 'sparklines',
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      colors: [secondarylight],
      type: 'solid',
      opacity: 0.05,
    },
    markers: {
      size: 0,
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
    },
  };

  const seriescolumnchart = [
    {
      name: 'Profits',
      color: secondary,
      data: monthlyProfits,
    },
    {
      name: 'Losses',
      color: errorlight,
      data: monthlyLosses,
    },
  ];

  const netEarnings = totalEarnings - totalLosses;
  const percentageChange = totalLosses > 0 ? ((netEarnings / totalLosses) * 100).toFixed(2) : '0';

  return (
    <DashboardCard
      title="Monthly Earnings"
      action={
        <Fab color="secondary" size="medium" sx={{ color: '#ffffff' }}>
          <IconCurrencyDollar width={24} />
        </Fab>
      }
      footer={
        <Chart options={optionscolumnchart} series={seriescolumnchart} type="area" height={60} width={"100%"} />
      }
    >
      <>
        <Typography variant="h3" fontWeight="700" mt="-20px">
          ${netEarnings.toFixed(2)}
        </Typography>
        <Stack direction="row" spacing={1} my={1} alignItems="center">
          <Avatar sx={{ bgcolor: errorlight, width: 27, height: 27 }}>
            <IconArrowDownRight width={20} color="#FA896B" />
          </Avatar>
          <Typography variant="subtitle2" fontWeight="600">
            +{percentageChange}%
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            compared to last year
          </Typography>
        </Stack>
      </>
    </DashboardCard>
  );
};

export default MonthlyEarnings;
