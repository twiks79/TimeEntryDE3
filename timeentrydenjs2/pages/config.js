
import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { Autocomplete, } from '@mui/material';
import { AccessTime, Delete, Description as DescriptionIcon, Edit, Surfing } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MaterialReactTable } from 'material-react-table';
import dayjs from 'dayjs';
import useSession from '../utils/useSession';
import logToServer from '../utils/lib';

const ConfigPage = () => {
    logToServer("config.js: ConfigPage");

    const { session, isLoading } = useSession();
    const { username } = session.username;

    const [data, setData] = useState([]);
    logToServer("config.js: data", data);


    const [isEditing, setIsEditing] = useState(false);



    const [open, setOpen] = useState(false);
    const [newData, setNewData] = useState({});

    const handleNoEndDate = () => {
        setFormData({ ...formData, endDate: dayjs("9999-12-31") });
    };


    const [employers, setEmployers] = useState([]);


    // rowKey should be invisible
    const columns = [
        {
            id: 'actions',
            header: 'Actions',
            Cell: ({ row }) => renderRowActions(row),
            accessorKey: 'actions'
        },
        { header: 'Partition Key', accessorKey: 'partitionKey', isVisible: false },
        { header: 'Row Key', accessorKey: 'rowKey', isVisible: false },
        { header: 'Employee', accessorKey: 'employee' },
        { header: 'Employer', accessorKey: 'employer' },
        { header: 'Contract Name', accessorKey: 'contractName' },
        { header: 'Start Date', accessorKey: 'startDate' },
        { header: 'End Date', accessorKey: 'endDate' },
        { header: 'Hours Per Week', accessorKey: 'hoursPerWeek' },
        { header: 'Compensation Per Hour', accessorKey: 'compensationPerHour' },
    ];
    logToServer("config.js: columns" + columns);

    const fetchData = async () => {
        try {
            const user2 = session ? session.username : null;
            if (!user2) {
                console.error("Session username is not available");
                return;
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


    const [formData, setFormData] = useState({
        employee: session ? session.username : null,
        employer: "test",
        contractName: "test",
        startDate: dayjs("2024-01-02"),
        endDate: dayjs("2024-12-31"),
        hoursPerWeek: "4",
        compensationPerHour: "20",
    });


    const [employerInputValue, setEmployerInputValue] = useState('');

    const handleEmployerChange = (event, newValue) => {
        setFormData({ ...formData, employer: newValue });
    };

    const handleEmployerInputChange = (event, newInputValue) => {

        if (employers.includes(newInputValue)) {
            // Existing employer, use object format
            setFormData({
                ...formData,
                employer: {
                    label: newInputValue
                }
            });
        } else {
            // New employer, just set directly
            setFormData({
                ...formData,
                employer: newInputValue
            });
        }

        setEmployerInputValue(newInputValue);

    };

// Update DatePicker handling
const handleStartDateChange = (newValue) => {
    setFormData({ ...formData, startDate: newValue });
};

const handleEndDateChange = (newValue) => {
    setFormData({ ...formData, endDate: newValue });
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

const getOptionLabel = (option) => {

    // If option is a string, just return the string
    if (typeof option === 'string') {
        return option;
    }

    // Option must be an object - return the label prop
    return option.label;

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
                            endDate: dayjs(row.original.endDate)
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
        <div style={{ mt: '20px' }}>
            <MaterialReactTable
                columns={columns}
                initialState={{
                    sorting: [{ id: "startDate", desc: true }],
                    columnVisibility: { partitionKey: false, rowKey: false },
                    density: "compact",
                }}
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
                <Grid container spacing={2} sx={{ mt: 1 }}>
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
                            options={employers.map((option) => option)}
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