// pages/employers.js

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Container, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import useSession from '../utils/useSession';

const EmployersPage = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const { session } = useSession();
  const router = useRouter();

  // Fetch employees when the component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      // Fetch data where the current user is the employer
      const response = await fetch(`/api/employer/get_data?employer=${encodeURIComponent(session.username)}`);
      const data = await response.json();
      setEmployees(data);
    };

    if (session.isLoggedIn) {
      fetchEmployees();
    }
  }, [session]);

  const handleEmployeeChange = (event) => {
    setSelectedEmployee(event.target.value);
  };

  const handleLoadTimeEntries = () => {
    router.push(`/timeentry?employee=${encodeURIComponent(selectedEmployee)}`);
  };

  return (
    <Container component="main" sx={{ padding: '4px' }}>
      <Box
        sx={{
          marginTop: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Employer Dashboard
        </Typography>

        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel id="employee-select-label">Select Employee</InputLabel>
          <Select
            labelId="employee-select-label"
            id="employee-select"
            value={selectedEmployee}
            label="Select Employee"
            onChange={handleEmployeeChange}
          >
            {employees.map((employee) => (
              <MenuItem key={employee.id} value={employee.username}>
                {employee.username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" color="primary" onClick={handleLoadTimeEntries}>
          Load Time Entries
        </Button>
      </Box>
    </Container>
  );
};

export default EmployersPage;
