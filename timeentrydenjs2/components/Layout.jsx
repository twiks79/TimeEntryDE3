// Layout.jsx

import { ActiveUserContext } from './ActiveUserContext';
import React, { useContext, useEffect } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LogoutIcon from '@mui/icons-material/Logout';
import IconButton from '@mui/material/IconButton';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import HomeIcon from '@mui/icons-material/Home';
import TimerIcon from '@mui/icons-material/Timer';
import InfoIcon from '@mui/icons-material/Info';
import ConfigIcon from '@mui/icons-material/Settings';
import OverviewIcon from '@mui/icons-material/Visibility'; 
import Link from 'next/link';
import useSession from "../utils/useSession";
import { defaultSession } from "../utils/lib";
import { useRouter } from 'next/router';
import LoginC from '../pages/LoginC';


const drawerWidth = 240;

export default function Layout({ children }) {
  const [open, setOpen] = React.useState(true);
  const { session, isLoading } = useSession();
  const { logout } = useSession();
  const router = useRouter();
  const { activeUser, updateActiveUser } = useContext(ActiveUserContext);

  useEffect(() => {
    // Fetch active user data on mount
    const fetchActiveUser = async () => {
      try {
        const response = await fetch('/api/session/getActiveUser', {
          method: 'GET',
        });
        if (response.ok) {
          const data = await response.json();
          updateActiveUser(data); // Update active user context
        }
      } catch (error) {
        console.error('Error fetching active user:', error);
      }
    };
    fetchActiveUser();
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <TimerIcon sx={{ mr: 2 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Time Entry App - Beta Version
          </Typography>

          {/* Show activeUser if available */}
          <Typography variant="subtitle1" noWrap sx={{ mr: 2 }}>
            {activeUser ? `Active User: ${activeUser}` : null}
          </Typography>


          {/* Show username */}
          {session.isLoggedIn && (
            <Typography variant="subtitle1" noWrap sx={{ mr: 2 }}>
              {session.username ? `Logged in as: ${session.username}` : null}
            </Typography>
          )}

          {/* Logout button */}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="logout"
            onClick={(event) => {
              event.preventDefault();
              logout(null, {
                optimisticData: defaultSession,
              });
              // reroute to login page
              router.push('/LoginC');
            }}
          >
            <LogoutIcon />
          </IconButton>

        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          display: open ? 'block' : 'none', // Hide the drawer when closed
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {/* Start Page Item */}
            <ListItemButton component={Link} href="/">
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Start Page" />
            </ListItemButton>

            {/* Time Entry Item */}
            <ListItemButton component={Link} href="/timeentry">
              <ListItemIcon>
                <TimerIcon />
              </ListItemIcon>
              <ListItemText primary="Time Entry" />
            </ListItemButton>

            {/* Configuration Item */}
            <ListItemButton component={Link} href="/config">
              <ListItemIcon>
                <ConfigIcon />
              </ListItemIcon>
              <ListItemText primary="Configuration" />
            </ListItemButton>

             {/* For Overview Item */}
          <ListItemButton component={Link} href="/overview">
            <ListItemIcon>
              <OverviewIcon />
            </ListItemIcon>
            <ListItemText primary="Your Overview" />
          </ListItemButton>

          {/* For Employers Item */}
          <ListItemButton component={Link} href="/employers">
            <ListItemIcon>
              <BusinessCenterIcon />
            </ListItemIcon>
            <ListItemText primary="For Employers" />
          </ListItemButton>
          
            {/* About Us Item */}
            <ListItemButton component={Link} href="/about">
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About Us" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          paddingTop: '0px', // Adjust top padding to move content more to the top
          paddingLeft: '0px', // Adjust left padding to move content more to the left
        }}
      >
        <Toolbar />
        {/* add margin around children */}
        <Box sx={{ margin: '20px' }}>
          {/* if logged in call children, if not call LoginC */}
          {session.isLoggedIn ? children : <LoginC />}
          
        </Box>
      </Box>
    </Box>
  );
}
