import React, { useEffect, useState } from 'react';
import { Container, Typography, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import logToServer from '@/utils/lib';

const Overview = () => {
    const [weeklyStats, setWeeklyStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/timeentry/overview', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const result = await response.json();
                logToServer('Overview data fetched successfully');
                logToServer('Weekly Stats:' + JSON.stringify(result, null, 2));

                setWeeklyStats(result?.weeklyStats || {}); // Update state with weeklyStats

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

    // Calculate total sick days and vacation days
    const totalSickDays = Object.values(weeklyStats).reduce((acc, week) => acc + week.sickDays, 0);
    const totalVacationDays = Object.values(weeklyStats).reduce((acc, week) => acc + week.vacationDays, 0);

    return (
        <Container component="main" sx={{ padding: '4px' }}>
            <Typography variant="h4" gutterBottom>Overview</Typography>
            
            <Typography variant="h6" gutterBottom>Weekly Stats</Typography>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Week Number</TableCell>
                        <TableCell align="right">Hours Worked</TableCell>
                        <TableCell align="right">Sick Days</TableCell>
                        <TableCell align="right">Vacation Days</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(weeklyStats).map(([week, stats]) => (
                        <TableRow key={week}>
                            <TableCell component="th" scope="row">
                                {week}
                            </TableCell>
                            <TableCell align="right">{stats.hours}</TableCell>
                            <TableCell align="right">{stats.sickDays}</TableCell>
                            <TableCell align="right">{stats.vacationDays}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
                Total Vacation Days: {totalVacationDays}
            </Typography>
            <Typography variant="h6" gutterBottom>
                Total Sick Days: {totalSickDays}
            </Typography>
        </Container>
    );
};

export default Overview;
