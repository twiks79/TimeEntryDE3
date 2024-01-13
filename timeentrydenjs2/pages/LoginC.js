import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    FormControlLabel,
    Checkbox,
    Link,
    Grid,
    Box,
    Typography,
    Container,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import useSession from "../utils/useSession";
import { defaultSession } from "../utils/lib";
import { loginUser } from '../utils/login/loginUser';

const theme = createTheme();

const LoginC = () => {
    const { session, isLoading } = useSession();
    const { login } = useSession();


    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    // State to control the opening of the dialog
    const [open, setOpen] = useState(false);

    const handleChange = (prop) => (event) => {
        setCredentials({ ...credentials, [prop]: event.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSignUp) {
            // Perform the sign-up via the server-side API
            try {
                const res = await fetch('/api/signup', { // Update the URL to your login endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(credentials),
                });

                const data = await res.json();

                if (res.ok) {
                    // Assuming the server responds with user data on successful login
                    console.log('User signed up', data.user);
                    // Call any method that sets the user session or any redirection if needed
                    router.push('/');
                } else {
                    throw new Error(data.error || 'Login failed');
                }
            } catch (error) {
                setError(error.message); // Update the error state with the message from server or fallback error
            }
        } else {

            // Perform the login via the server-side API
            try {
                const res = await fetch('/api/login', { // Update the URL to your login endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(credentials),
                });

                const data = await res.json();

                if (res.ok) {
                    // Assuming the server responds with user data on successful login
                    console.log('User logged in', data.user);
                    // Call any method that sets the user session or any redirection if needed
                    
                    router.push('/');
                } else {
                    throw new Error(data.error || 'Login failed');
                }
            } catch (error) {
                setError(error.message); // Update the error state with the message from server or fallback error
            }
        }
    };


    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setError(''); // Clear any existing errors
    };

    // Functions to handle dialog open/close
    const handleDialogOpen = () => {
        setOpen(true);
    };

    const handleDialogClose = () => {
        setOpen(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                {error && <Alert severity="error">{error}</Alert>}
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        {isSignUp ? 'Sign Up' : 'Login'}
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={credentials.username}
                            onChange={handleChange('username')}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={credentials.password}
                            onChange={handleChange('password')}
                        />
                        {/* <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Remember me"
                        />
                        */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {isSignUp ? 'Sign Up' : 'Login'}
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                {!isSignUp && (
                                    <Link href="#" variant="body2" onClick={handleDialogOpen}>
                                        Forgot password?
                                    </Link>
                                )}
                            </Grid>
                            <Grid item>
                                <Link href="#" variant="body2" onClick={toggleMode}>
                                    {isSignUp ? 'Back to Login' : "Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>

                {/* Dialog component for 'Forgot password?' */}
                <Dialog open={open} onClose={handleDialogClose}>
                    <DialogContent>
                        <DialogContentText>
                            Please contact the support team.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDialogClose} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </ThemeProvider>
    );
};

export default LoginC;
