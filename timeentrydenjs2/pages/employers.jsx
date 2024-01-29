// pages/employers.js

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Container, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import useSession from '../utils/useSession';
import logToServer from '@/utils/lib';

const EmployersPage = () => {
	const [selectedEmployee, setSelectedEmployee] = useState('');
	const [employees, setEmployees] = useState([]);

	const { session } = useSession();
	const username = session.username;

	logToServer('Employers session: ' + username);

	const fetchEmployees = async (username) => {
		try {

			const response = await fetch(`/api/employer/get_data_employer?employer=${encodeURIComponent(username)}`, {
				method: 'GET'
			});
			// Handle 404 specifically
			if (response.status === 404) {
				logToServer('API route not found')
			}
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			logToServer('fetch employees response: ' + JSON.stringify(response));
			const data = await response.json();
			logToServer('fetch employees data: ' + data);
			logToServer(data);

			// Map data to array of objects with username 
			const employees = data.map(username => ({ username }));

			// Log to inspect
			for (const employee of employees) {
				logToServer('Employee: ' + employee.username);
			}

			setEmployees(employees);
		} catch (error) {
			logToServer('fetch employees error: ' + error);
			console.error(error);
		}
	}
	useEffect(() => {
		fetchEmployees(username);
	}, [username]);




	const handleEmployeeChange = (event) => {
		setSelectedEmployee(event.target.value);
	};

	const setActiveUser = async () => {
		const response = await fetch(`/api/employer/setActiveUser?user=${encodeURIComponent(selectedEmployee)}`);
		const data = await response.json();
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
							<MenuItem key={employee.username} value={employee.username}>{employee.username}</MenuItem>
						))}
					</Select>

				</FormControl>

				<Button variant="contained" color="primary" onClick={setActiveUser}>
					Set Active User
				</Button>
			</Box>
		</Container>
	);
};

export default EmployersPage;
