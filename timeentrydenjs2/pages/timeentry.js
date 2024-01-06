import React, { useEffect, useState, useMemo } from "react";

import {
  Box,
  Button,
  Dialog,
  Container,
  DialogActions,
  DialogContent,
  DialogTitle,
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

import dayjs from "dayjs";
import useMediaQuery from "@mui/material/useMediaQuery"; // Import useMediaQuery

const TimeEntry = () => {
  const isMobile = useMediaQuery("(max-width:600px)"); // Check if the screen width is less than or equal to 600px

  // Add 'isMobile' as a dependency in the useMemo dependency array
  const memoizedValue = useMemo(() => {
    // Your memoized value calculation here
  }, [isMobile]);

  const [data, setData] = useState([]);
  
  const [formData, setFormData] = useState({
    date: dayjs(),
    hours: "1",
    comment: "",
  });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [totalHours, setTotalHours] = useState(0);
  const [totalHoursYear, setTotalHoursYear] = useState(0);
  const [entryType, setEntryType] = useState("Time Entry");

  // Calculate the sum of hours for the selected month
  useEffect(() => {
    const sumHours = data
      .filter((row) => {
        const rowDate = dayjs(row.date);
        return (
          rowDate.month() === selectedMonth && rowDate.year() === selectedYear
        );
      })
      .reduce((sum, current) => sum + Number(current.hours), 0);
    setTotalHours(sumHours);
  }, [data, selectedMonth, selectedYear]);

  // Calculate the sum of hours for the selected year
  useEffect(() => {
    const sumHours = data
      .filter((row) => {
        const rowDate = dayjs(row.date);
        return rowDate.year() === selectedYear;
      })
      .reduce((sum, current) => sum + Number(current.hours), 0);
    setTotalHoursYear(sumHours);
  }, [data, selectedYear]);

  // Fetch data from the server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/timeentry/get_data");
        const data = await response.json();
        
        
        setData(response.data);
      } catch (error) {
        console.error("Error fetching DataTable data", error);
      }
    };
    fetchData();
  }, []);

  // Add row to the server and update the state
  const handleAddRow = async () => {
    const payload = {
      ...formData,
      type: entryType, // Add this line
      date: formData.date.format("YYYY-MM-DD"),
    };

    try {
      
      // adding a row by calling /api/timeentry/add_row next.js api
      const response = await fetch("/api/timeentry/add_row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });


      if (response.data && response.data.row) {
        // Update the data state with the new row
        setData((prevData) => [...prevData, response.data.row]);
      }
    } catch (error) {
      console.error("Error adding new row:", error);
    }
  };
  // implement an alternative to the handleEditRow below and implement it exactly like handleAddRow
  const handleEditRow = async () => {
    const payload = {
      id: currentRow.id,
      date: formData.date.format("YYYY-MM-DD"),
      hours: formData.hours,
      type: entryType, // Add this line
      comment: formData.comment,
    };

    try {
    
      // call the /api/timeentry/update_row next.js api
      const response = await fetch("/api/timeentry/update_row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      
      
      if (response.data && response.data.row) {
        // Update the data state with the changed row and match id
        setData((prevData) =>
          prevData.map((row) =>
            row.id === currentRow.id ? { ...row, ...payload } : row
          )
        );
      }
    } catch (error) {
      console.error("Error updating:", error);
    }
  };

  // Delete row on the server and update the state
  const handleDeleteRow = async (row) => {
    try {
      
      const response = await fetch("/api/timeentry/delete_row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: row.id }),
      });

      if (response.data.success) {
        setData((prevData) => prevData.filter((r) => r.id !== row.id));
      }
    } catch (error) {
      console.error("Error deleting row:", error);
      // Handle the error appropriately
    }
  };

  // define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "date",
        header: "Date",
      },
      // add a column to indicate whether it is a time entry, sick entry, or vacation entry
      {
        accessorKey: "type",
        header: "Type",
      },
      {
        accessorKey: "hours",
        header: "Hours",
      },
      {
        accessorKey: "comment",
        header: "Comment",
        Cell: ({ cell }) => (
          <div style={{ whiteSpace: "normal", wordWrap: "break-word" }}>
            {cell.getValue()}
          </div>
        ),
        width: isMobile ? "auto" : 150, // Use 'auto' width for mobile
      },
      // Add more columns as needed
    ],
    []
  );

  // Dialog content for adding/editing rows
  const renderDialog = () => (
    <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)}>
      <DialogTitle>{isEditing ? "Edit Row" : "Add New Row"}</DialogTitle>
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
              <Box
                width="100%"
                margin="normal"
                sx={{ padding: "4px", marginBottom: "1em" }}
              >
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(newValue) => {
                    // Ensure the date is being set as a dayjs object
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
              </Box>
            </LocalizationProvider>
            <Box width="100%" margin="normal" sx={{ padding: "4px" }}>
              <FormControl fullWidth>
                <InputLabel id="entry-type-label">Type</InputLabel>
                <Select
                  labelId="entry-type-label"
                  id="entry-type"
                  value={entryType}
                  onChange={(e) => setEntryType(e.target.value)}
                >
                  <MenuItem value={"Time Entry"}>Time Entry</MenuItem>
                  <MenuItem value={"Vacation Day"}>Vacation Day</MenuItem>
                  <MenuItem value={"Sick Leave"}>Sick Leave</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box width="100%" margin="normal" sx={{ padding: "4px" }}>
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
            </Box>
            <Box width="100%" margin="normal" sx={{ padding: "4px" }}>
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
          </Box>
        </Container>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
        <Button
          onClick={() => {
            // Convert dayjs object to string when sending to the backend
            const formattedDate = formData.date
              ? formData.date.format("YYYY-MM-DD")
              : "";
            const payload = {
              ...formData,
              type: entryType, // Add this line
              date: formData.date.format("YYYY-MM-DD"),
            };
            if (isEditing) {
              /* / handleEditRow(payload); // Pass the formatted payload */
              handleEditRow();
            } else {
              handleAddRow(); // Pass the formatted payload
            }
            setCreateModalOpen(false);
          }}
        >
          {isEditing ? "Save Changes" : "Add Row"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box width="100%">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            flexWrap: "wrap",
          }}
        >
          <FormControl variant="standard" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel id="select-month-label">Month</InputLabel>
            <Select
              labelId="select-month-label"
              id="select-month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, index) => (
                <MenuItem key={index} value={index}>
                  {dayjs().month(index).format("MMMM")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="standard" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel id="select-year-label">Year</InputLabel>
            <Select
              labelId="select-year-label"
              id="select-year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {Array.from({ length: 5 }, (_, index) => (
                <MenuItem key={index} value={dayjs().year() - index}>
                  {dayjs().year() - index}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography sx={{ mr: 2 }}>
            Total hours that month: {totalHours}
          </Typography>
          <Typography sx={{ mr: 2 }}>
            Total hours this year: {totalHoursYear}
          </Typography>
        </Box>
        <MaterialReactTable
          size={isMobile ? "small" : "medium"}
          initialState={{
            sorting: [{ id: "date", desc: true }],
            columnVisibility: { id: false },
            density: isMobile ? "compact" : "standard",
          }}
          columns={columns}
          // make it downloadable
          exportable
          data={data
            .slice(-31)
            .sort((a, b) => dayjs(b.date).diff(dayjs(a.date)))} // Sort and limit to last 31 entries
          // Additional styles for compact display and vertical scrolling
          sx={{
            ".MuiDataGrid-root .MuiDataGrid-row": {
              minHeight: "32px", // Reduce row height for a more compact display
              // adjust it to the width of the screen
              width: isMobile ? "auto" : "100%",
            },
            ".MuiDataGrid-viewport": {
              overflowY: "auto", // Enable vertical scrolling
            },
            ".MuiDataGrid-cell": {
              padding: "4px", // Adjust padding as needed
              width: "auto", // Make the columns smaller
            },
            // make the width of the columns smaller, not the font size
            ".MuiDataGrid-colCellWrapper": {
              width: "auto",
            },
            ".MuiDataGrid-columnHeaderTitleContainer": {
              padding: "0px 4px",
            },
          }}
          renderRowActions={({ row }) => (
            <Box sx={{ display: "flex", gap: "1rem" }}>
              <Tooltip title="Edit">
                <IconButton
                  sx={{ padding: "4px" }} // Smaller padding for icons
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
                  <Edit fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  sx={{ padding: "4px" }} // Smaller padding for icons
                  color="error"
                  onClick={() => handleDeleteRow(row.original)}
                >
                  <Delete fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          enableRowActions
          enableEditing
          renderTopToolbarCustomActions={() => (
            <Box sx={{ display: "flex", gap: "1rem" }}>
              <Button
                startIcon={<AccessTime />}
                color="primary"
                variant="contained"
                onClick={() => {
                  setIsEditing(false);
                  setEntryType("Time Entry"); // Add this line
                  setFormData({ date: dayjs(), hours: "1", comment: "" });
                  setCreateModalOpen(true);
                }}
              >
                Add Time Entry
              </Button>
              <Button
                startIcon={<Surfing />}
                color="primary"
                variant="contained"
                onClick={() => {
                  setIsEditing(false);
                  setEntryType("Vacation Day"); // Add this line
                  setFormData({ date: dayjs(), hours: "1", comment: "" });
                  setCreateModalOpen(true);
                }}
              >
                Add Vacation Day
              </Button>
              <Button
                startIcon={<Sick />}
                color="primary"
                variant="contained"
                onClick={() => {
                  setIsEditing(false);
                  setEntryType("Sick Leave"); // Add this line
                  setFormData({ date: dayjs(), hours: "1", comment: "" });
                  setCreateModalOpen(true);
                }}
              >
                Add Sick Leave
              </Button>
              {/* Add more props and configurations as needed */}
            </Box>
          )}
        />
        {renderDialog()}
      </Box>
    </LocalizationProvider>
  );
};

export default TimeEntry;