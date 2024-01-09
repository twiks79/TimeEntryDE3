import React, { useState } from "react";
import {
    Button,
    Dialog,
    Container,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const TimeEntry = ({ open, onClose, handleAddRow }) => {
    const [formData, setFormData] = useState({
        date: dayjs(),
        hours: "1",
        comment: "",
    });

    const [entryType, setEntryType] = useState("Time Entry");

    const handleSubmit = async () => {
        const formattedDate = formData.date
            ? formData.date.format("YYYY-MM-DD")
            : "";
        const payload = {
            ...formData,
            date: formattedDate,
            type: entryType,
        };

        try {
            const response = await fetch('/api/timeentry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.success) {
                    handleAddRow(payload);
                }
            } else {
                // Handle HTTP errors
                console.error('HTTP Error:', response.statusText);
            }
        } catch (error) {
            console.error('Error submitting row:', error);
            // Handle fetch errors
        }

        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Add New Row</DialogTitle>
            <DialogContent>
                <Container component="main" sx={{ padding: "4px" }}>
                    <Box
                        sx={{
                            marginTop: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Date"
                                value={formData.date}
                                onChange={(newValue) => {
                                    setFormData({ ...formData, date: newValue });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        margin="normal"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />
                        </LocalizationProvider>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="entry-type-label">Type</InputLabel>
                            <Select
                                labelId="entry-type-label"
                                id="entry-type"
                                value={entryType}
                                onChange={(e) => setEntryType(e.target.value)}
                            >
                                <MenuItem value="Time Entry">Time Entry</MenuItem>
                                <MenuItem value="Vacation Day">Vacation Day</MenuItem>
                                <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            margin="normal"
                            required
                            id="hours"
                            label="Hours"
                            name="hours"
                            type="number"
                            value={formData.hours}
                            onChange={(e) =>
                                setFormData({ ...formData, hours: e.target.value })
                            }
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            required
                            id="comment"
                            label="Comment"
                            name="comment"
                            multiline
                            rows={3}
                            value={formData.comment}
                            onChange={(e) =>
                                setFormData({ ...formData, comment: e.target.value })
                            }
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>
                </Container>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit}>Add Row</Button>
            </DialogActions>
        </Dialog>
    );
};

export default TimeEntry;