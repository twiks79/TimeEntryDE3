import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { Autocomplete } from '@mui/material';
import { AccessTime, Delete, Description as DescriptionIcon, Edit, Surfing } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MaterialReactTable } from 'material-react-table';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // Import UTC plugin
import timezone from 'dayjs/plugin/timezone'; // Import timezone plugin

import useSession from '../utils/useSession';
import logToServer from '../utils/lib';
import { useContext } from 'react';
import { ActiveUserContext } from '../components/ActiveUserContext';

const ConfigPage = () => {
    logToServer("config.js: ConfigPage");

    // Extend dayjs with plugins
    dayjs.extend(utc);

    const { session, isLoading } = useSession();
    const username = session?.username;
    const { activeUser, setActiveUser } = useContext(ActiveUserContext);

    const [data, setData] = useState([]);
    logToServer("config.js: data", data);

    const [isEditing, setIsEditing] = useState(false);
    const [open, setOpen] = useState(false);
    const [newData, setNewData] = useState({});
    const [employers, setEmployers] = useState([]);

    const [formData, setFormData] = useState({
        employee: activeUser || (session ? session.username : null),
        employer: "",
        contractName: "test",
        startDate: dayjs("2024-01-02").utc().format(),
        endDate: dayjs("2024-12-31").utc().format(),
        hoursPerWeek: "4",
        compensationPerHour: "20",
    });

    const [employerInputValue, setEmployerInputValue] = useState('');

    const handleEmployerChange = (event, newValue) => {
        if (typeof newValue === 'string') {
            setFormData({ ...formData, employer: newValue });
        } else if (newValue && newValue.inputValue) {
            // Create a new value from the user input
            setFormData({ ...formData, employer: newValue.inputValue });
        } else {
            setFormData({ ...formData, employer: newValue });
        }
    };

    const handleEmployerInputChange = (event, newInputValue) => {
        setEmployerInputValue(newInputValue);
    };

    const getOptionLabel = (option) => {
        // Handle the option directly if it's a string
        if (typeof option === 'string') return option;
        // If it's an object, return a specified property
        return option.label || "";
    };


    // rowKey should be invisible
    const columns = [
        {
            id: 'actions',
            header: 'Actions',
            Cell: ({ row }) => renderRowActions(row),
            accessorKey: 'actions',
            grow: true,
            size: 30
        },
        { header: 'Partition Key', accessorKey: 'partitionKey', isVisible: false },
        { header: 'Row Key', accessorKey: 'rowKey', isVisible: false },
        { header: 'Employee', accessorKey: 'employee', grow: true, size: 20 },
        { header: 'Employer', accessorKey: 'employer', grow: true, size: 20 },
        { header: 'Contract Name', accessorKey: 'contractName', grow: true, size: 30 },
        { header: 'Start Date', accessorKey: 'startDate', grow: true, size: 30 },
        { header: 'End Date', accessorKey: 'endDate', grow: true, size: 30 },
        { header: 'Hours Per Week', accessorKey: 'hoursPerWeek', grow: true, size: 30 },
        { header: 'Compensation Per Hour', accessorKey: 'compensationPerHour', grow: true, size: 20 },
    ];
    logToServer("config.js: columns" + columns);

    const fetchData = async () => {
        try {
            let user2 = session ? session.username : null;
            if (!user2) {
                console.error("Session username is not available");
                return;
            }
            if (activeUser) {
                user2 = activeUser;
            }

            logToServer("config.js: fetching data");
            const queryParams = `user=${encodeURIComponent(user2)}`;
            const response = await fetch(`/api/employer/get_data?${queryParams}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setData(data);
            // Extract unique employers from the data
            const uniqueEmployers = Array.from(new Set(data.map(item => item.employer)));
            setEmployers(uniqueEmployers);
            logToServer("config.js: uniqueEmployers: " + employers);

        } catch (err) {
            logToServer("config.js: error fetching data " + err);
            console.error("Error in fetchData: ", err);
        }
    }



    useEffect(() => {
        const fetchInitialData = async () => {
            await fetchData();
        };

        fetchInitialData();
    }, []); // Empty dependency array to ensure it runs only once on mount

    // Update DatePicker handling
    const handleStartDateChange = (newValue) => {
        setFormData({ ...formData, startDate: dayjs(newValue).utc() });
    };

    const handleEndDateChange = (newValue) => {
        logToServer("config.js: handleEndDateChange" + dayjs(newValue).utc());
        setFormData({ ...formData, endDate: dayjs(newValue).utc(false) });
    };

    const handleDelete = async (row) => {
        logToServer("config.js: handleDelete");
        try {
            const response = await fetch('/api/employer/delete_row', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // This line is essential
                },
                body: JSON.stringify(row)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            await fetchData();
        } catch (err) {
            console.error("Error in handleDelete: ", err);
        }
    }

    const handleAdd = async () => {
        try {
            const response = await fetch('/api/employer/add_row', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // This line is essential
                },
                body: JSON.stringify({ ...formData })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setOpen(false);
            await fetchData();
        } catch (err) {
            console.error("Error in handleAdd: ", err);
        }
    }

    const handleUpdate = async () => {
        try {
            logToServer("formdata: " + formData.employer + " " + formData.contractName + " " + formData.startDate + " " + dayjs(formData.endDate).toString() + " " + formData.hoursPerWeek + " " + formData.compensationPerHour);
            const response = await fetch('/api/employer/update_row', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // This line is essential
                },
                body: JSON.stringify({
                    ...formData
                })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setOpen(false);
            setIsEditing(null);
            await fetchData();
        } catch (err) {
            console.error("Error in handleUpdate: ", err);
        }
    }

    const renderRowActions = (row) => {
        return (
            <Box>
                <Tooltip title="Edit">
                    <IconButton
                        onClick={() => {
                            setIsEditing(true);
                            setOpen(true);
                            // setCurrentRow(row.original);
                            setFormData({
                                ...row.original,
                                startDate: dayjs(row.original.startDate),
                                endDate: dayjs(row.original.endDate),
                            });
                            // setCreateModalOpen(true);
                        }}
                    >
                        <Edit />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Delete">
                    <IconButton onClick={() => {
                        logToServer('Delete onClick');
                        handleDelete(row.original)
                    }}>
                        <Delete color="error" />
                    </IconButton>
                </Tooltip>
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div style={{ marginTop: '20px' }}>
                <MaterialReactTable
                    columns={columns}
                    initialState={{
                        sorting: [{ id: "startDate", desc: true }],
                        columnVisibility: { partitionKey: false, rowKey: false },
                        density: "compact",
                    }}
                    margin="normal"
                    padding="normal"
                    layoutmode="grid"
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
                                    setIsEditing(null);
                                }}
                            >
                                Add Contract
                            </Button>
                        </Box>
                    )}
                />
            </div>
            <Dialog open={open}>
                <DialogTitle>
                    {isEditing ? 'Edit Row' : 'Add Row'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ marginTop: 1 }}>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Employee"
                                value={formData.employee}
                                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <Autocomplete
                                freeSolo
                                value={formData.employer}
                                onChange={handleEmployerChange}
                                inputValue={employerInputValue}
                                onInputChange={handleEmployerInputChange}
                                options={employers}
                                getOptionLabel={getOptionLabel}
                                renderInput={(params) => (
                                    <TextField {...params} label="Employer" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Contract Name"
                                value={formData.contractName}
                                onChange={(e) => setFormData({ ...formData, contractName: e.target.value })}
                            />
                        </Grid>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Grid item xs={12} sm={6} md={4}>
                                <DatePicker
                                    fullWidth
                                    label="Start Date"
                                    value={formData.startDate}
                                    onChange={handleStartDateChange}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <DatePicker
                                    fullWidth
                                    label="End Date"
                                    value={formData.endDate}
                                    onChange={handleEndDateChange}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </Grid>
                        </LocalizationProvider>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Hours Per Week"
                                value={formData.hoursPerWeek}
                                onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Compensation Per Hour"
                                value={formData.compensationPerHour}
                                onChange={(e) => setFormData({ ...formData, compensationPerHour: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={isEditing ? handleUpdate : handleAdd}>
                        {isEditing ? 'Save' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

        </LocalizationProvider>
    );
}

export default ConfigPage;
