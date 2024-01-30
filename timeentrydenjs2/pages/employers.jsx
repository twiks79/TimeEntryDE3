import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Container, FormControl, InputLabel, Select, MenuItem, Typography, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material'; // Import the Delete icon
import useSession from '../utils/useSession';
import logToServer from '@/utils/lib';
import { useContext } from 'react';
import { ActiveUserContext } from '../components/ActiveUserContext';

const EmployersPage = () => {
	const [selectedEmployee, setSelectedEmployee] = useState('');
	const [employees, setEmployees] = useState([]);
	const { activeUser, setActiveUser } = useContext(ActiveUserContext);
	const { session } = useSession();
	const username = session.username;

	logToServer('Employers session: ' + username);

	const fetchEmployees = async (username) => {
		try {
			const response = await fetch(`/api/employer/get_data_employer?employer=${encodeURIComponent(username)}`, {
				method: 'GET'
			});
			if (response.status === 404) {
				logToServer('API route not found');
			}
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			const uniqueEmployees = [...new Set(data)]; // Remove duplicates
			const employeesList = uniqueEmployees.map(username => ({ username }));
			setEmployees(employeesList);
		} catch (error) {
			logToServer('fetch employees error: ' + error);
			console.error(error);
		}
	};

	useEffect(() => {
		fetchEmployees(username);
	}, [username]);

	const handleEmployeeChange = (event) => {
		setSelectedEmployee(event.target.value);
	};

	const handleDeleteEmployee = async () => {
		setSelectedEmployee('');
		setActiveUser('');
	};

	useEffect(() => {
		if (selectedEmployee === '' && activeUser === '') {
			setFormActiveUser();
		}
	}, [selectedEmployee, activeUser]);

	const setFormActiveUser = async () => {
		logToServer('setActiveUser: ' + selectedEmployee);
		try {
			const response = await fetch(`/api/session/setActiveUser?user=${encodeURIComponent(selectedEmployee)}`, {
				method: 'POST'
			});
			if (response.status === 404) {
				logToServer('API route not found');
			}
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			setActiveUser(selectedEmployee);
			logToServer('setActiveUser: ' + selectedEmployee);
		}
		catch (error) {
			logToServer('setActiveUser error: ' + error);
			console.error(error);
		}
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

				{activeUser && (
					<Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
						<Typography variant="subtitle1">
							Current active employee: {activeUser}
						</Typography>
						<IconButton color="error" onClick={handleDeleteEmployee}>
							<Delete />
						</IconButton>
					</Box>
				)}

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

				<Button variant="contained" color="primary" onClick={setFormActiveUser}>
					Set Active User
				</Button>
			</Box>
		</Container>
	);
};

export default EmployersPage;
