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

const theme = createTheme();

const LoginC = () => {
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
      console.log('signup');
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error);
      } else {
        router.push('/');
      }
    }

      // Sign in
      // clear any error
      setError('');
      try {
        await signIn('credentials', {
          username: credentials.username,
          password: credentials.password,
          callbackUrl: '/', // Redirect URL after successful login
        });
        // router.push('/');
      } catch (error) {
        setError('Invalid credentials' + error); // You can customize this error message
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
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
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
