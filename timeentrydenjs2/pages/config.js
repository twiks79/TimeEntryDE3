/**
 * index.js
 * This file contains the main page component for the Time Entry application.
 * It imports necessary dependencies and components, defines card data for different categories,
 * and renders the appropriate components based on the user's session status.
 */

import React, { useEffect, useState, useMemo } from "react";



import {
    Box,
    Button,
    Dialog,
    Container,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    TextField,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
} from "@mui/material";

import { Delete, Edit, AccessTime, Surfing } from "@mui/icons-material";
import Sick from "@mui/icons-material/Sick";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MaterialReactTable } from "material-react-table";
import DescriptionIcon from '@mui/icons-material/Description';

import dayjs from "dayjs";
import useMediaQuery from "@mui/material/useMediaQuery"; // Import useMediaQuery
import useSession from "../utils/useSession";
import logToServer, { defaultSession } from "../utils/lib";

const renderRowActions = (row) => {

    return (
        <Box>
            <Tooltip title="Edit">
                <IconButton
                    onClick={() => {
                        setIsEditing(true);
                        setCurrentRow(row.original);
                        setFormData({
                            ...row.original,
                            date: dayjs(row.original.date),
                        });
                        setCreateModalOpen(true);
                    }}
                >
                    <Edit />
                </IconButton>
            </Tooltip>

            <Tooltip title="Delete">
                <IconButton onClick={() => handleDelete(row.original)}>
                    <Delete color="error" />
                </IconButton>
            </Tooltip>
        </Box>
    );
}

const ConfigPage = () => {
    const [data, setData] = useState([]);
    const { session, isLoading } = useSession();
    const { username } = session.username;

    // Table columns
    /** the following column ids: PartitionKey, RowKey, Timestamp, employer, contractName, startDate, endDate, hoursPerWeek, compensationPerHour
      * */
    const columns = [
        { id: 'actions', header: 'Actions', Cell: renderRowActions, accessorKey: 'actions' },
        { header: 'Employee', accessorKey: 'rowKey' },
        { header: 'Employer', accessorKey: 'employer' },
        { header: 'Contract Name', accessorKey: 'contractName' },
        { header: 'Start Date', accessorKey: 'startDate' },
        { header: 'End Date', accessorKey: 'endDate' },
        { header: 'Hours Per Week', accessorKey: 'hoursPerWeek' },
        { header: 'Compensation Per Hour', accessorKey: 'compensationPerHour' },
    ];

    // Fetch table data
    const fetchData = async () => {
        const user2 = session.username;
        logToServer("config.js: fetching data");
        // Construct the query parameter string
        const queryParams = new URLSearchParams({ user2 }).toString();
        console.log('queryParams', queryParams);
        // Use backticks for the fetch URL and properly embed queryParams
        const response = await fetch(`/api/employer/get_data?${queryParams}`);

        logToServer("config.js: response", response);
        const data = await response.json();

        logToServer(data);

        setData(data);
    }

    // Fetch data initially
    useEffect(() => {
        fetchData();
    }, []);

    // Delete row
    const handleDelete = async (row) => {
        logToServer("config.js: handleDelete");
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



    return (
        <>

            <div style={{ mt: '20px' }}>

                <MaterialReactTable
                    columns={columns}
                    margin="normal"
                    padding="normal"
                    data={data}
                    dense={true}
                    small={true}
                    renderRowActions={renderRowActions}
                    renderTopToolbarCustomActions={() => (
                        <Box sx={{ display: "flex", gap: "1rem" }}>
                            <Button
                                startIcon={<DescriptionIcon />}
                                color="primary"
                                variant="contained"

                                onClick={() => {
                                    setOpen(true);
                                    setRowToUpdate(null);

                                }}
                            >
                                Add Contract
                            </Button>

                        </Box>
                    )}>

                </MaterialReactTable>
                <Dialog open={open}>
                    <DialogTitle>
                        {rowToUpdate ? 'Edit Row' : 'Add Row'}
                    </DialogTitle>
                    <div sx={{ p: 1 }}>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField label="Employee" />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="Employer" />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="Contract Name" />
                            </Grid>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Grid item xs={6}>
                                    <TextField label="Start Date" />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="End Date" />
                                </Grid>
                            </LocalizationProvider>
                            <Grid item xs={6}>
                                <TextField label="Hours Per Week" />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="Compensation Per Hour" />

                            </Grid>
                        </Grid>
                    </DialogContent>
                    </div>

                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={rowToUpdate ? handleUpdate : handleAdd}>
                            {rowToUpdate ? 'Save' : 'Add'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    )

}
export default ConfigPage;