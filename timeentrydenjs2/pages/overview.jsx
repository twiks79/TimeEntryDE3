import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Button, 
  Container, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography, 
  IconButton, 
  CircularProgress, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow 
} from '@mui/material';
import { Delete } from '@mui/icons-material'; // Import the Delete icon only once
import useSession from '../utils/useSession'; // Assuming useSession is a custom hook for session management
import logToServer from '@/utils/lib'; // Ensure the correct path if it's reused
import { ActiveUserContext } from '../components/ActiveUserContext'; // Import context only once
import dayjs from 'dayjs'; // Import dayjs only once for date manipulation


const Overview = () => {
    // State for storing fetched data
    const [data, setData] = useState({
        hoursPerMonth: [],
        sickDays: [],
        vacationDays: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data (you might need to replace this with your actual fetching logic)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Replace URL with your actual API endpoint
                const response = await fetch('/api/timeentry/overview');
                if (!response.ok) {
                    logToServer('Failed to fetch data');
                    throw new Error('Failed to fetch data');
                }
                const result = await response.json();
                setData({
                    hoursPerMonth: result.hoursPerMonth,
                    sickDays: result.sickDays,
                    vacationDays: result.vacationDays,
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container component="main" sx={{ padding: '4px' }}>
            <Box>
                <Typography variant="h4" gutterBottom>
                    Overview
                </Typography>
                {/* Render Hours Per Month Overview */}
                <Typography variant="h6">Hours Per Month</Typography>
                {/* Implement your logic to display hours per month and overtime/undertime */}

                {/* Render Sick Days Overview */}
                <Typography variant="h6">Sick Days</Typography>
                {/* Implement your logic to display sick days */}

                {/* Render Vacation Days Overview */}
                <Typography variant="h6">Vacation Days</Typography>
                {/* Implement your logic to display vacation days */}
            </Box>
        </Container>
    );
};

export default Overview;
