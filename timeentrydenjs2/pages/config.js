/**
 * index.js
 * This file contains the main page component for the Time Entry application.
 * It imports necessary dependencies and components, defines card data for different categories,
 * and renders the appropriate components based on the user's session status.
 */

import React from 'react';

import { Button, CircularProgress, Typography, Container, Grid } from '@mui/material';
import NextLink from 'next/link';
import CategorySection from '../components/CategorySection';
import Link from '@mui/material/Link';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessIcon from '@mui/icons-material/Business';
import OvertimeIcon from '@mui/icons-material/AccessAlarms';
import VacationIcon from '@mui/icons-material/FlightTakeoff';

import useSession from "../utils/useSession";
import { defaultSession } from "../utils/lib";
import loginUser from '../utils/login/loginUser'
import LoginC from './LoginC';

const [data, setData] = useState([]);

// Fetch data initially
useEffect(() => {
    fetchData();
}, []);

// Fetch table data
const fetchData = async () => {
    const response = await fetch('/api/employer/get_data');
    const data = await response.json();
    setData(data);
}

// Delete row
const handleDelete = async (row) => {
    await fetch('/api/employer/delete_row', {
        method: 'POST',
        body: JSON.stringify(row)
    });
    fetchData();
}

// Add row 
const [open, setOpen] = useState(false);
const [newData, setNewData] = useState({});

const handleAdd = async () => {
    await fetch('/api/employer/add_row', {
        method: 'POST',
        body: JSON.stringify(newData)
    });
    setOpen(false);
    fetchData();
}

// Update row
const [rowToUpdate, setRowToUpdate] = useState(null);

const handleUpdate = async () => {
    await fetch('/api/employer/update_row', {
        method: 'PUT',
        body: JSON.stringify({
            ...rowToUpdate,
            ...newData
        })
    });
    setOpen(false);
    fetchData();
}

// Table columns
/** the following column ids: PartitionKey, RowKey, Timestamp, employer, contractName, startDate, endDate, hoursPerWeek, compensationPerHour
  * */
const columns = [
    { Header: 'Partition Key', accessor: 'PartitionKey' },
    { Header: 'Employee', accessor: 'RowKey' },
    { Header: 'Timestamp', accessor: 'Timestamp' },
    { Header: 'Employer', accessor: 'employer' },
    { Header: 'Contract Name', accessor: 'contractName' },
    { Header: 'Start Date', accessor: 'startDate' },
    { Header: 'End Date', accessor: 'endDate' },
    { Header: 'Hours Per Week', accessor: 'hoursPerWeek' },
    { Header: 'Compensation Per Hour', accessor: 'compensationPerHour' },
    { Header: 'Actions', accessor: 'actions' }
];
];

return (
    <>
        <MaterialReactTable
            columns={columns}
            data={data}
            renderRowActions={(row) => (
                <Box>
                    <Tooltip title="Edit">
                        <IconButton
                            onClick={() => {
                                setOpen(true);
                                setNewData(row.original);
                                setRowToUpdate(row.original);
                            }}
                        >
                            <Edit />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(row.original)}>
                            <Delete />
                        </IconButton>
                    </Tooltip>
                </Box>
            )} /><Dialog open={open}>
            <DialogTitle>
                {rowToUpdate ? 'Edit Row' : 'Add Row'}
            </DialogTitle>

            {/* Form fields */}

            <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={rowToUpdate ? handleUpdate : handleAdd}>
                    {rowToUpdate ? 'Save' : 'Add'}
                </Button>
            </DialogActions>
        </Dialog>
    </>
)

}}