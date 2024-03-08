import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ActiveUserContext } from './ActiveUserContext';
import useSession from "../utils/useSession";
import { defaultSession } from "../utils/lib";
import LoginC from '../pages/LoginC';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu'; // Import for burger menu
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import TimerIcon from '@mui/icons-material/Timer';
import InfoIcon from '@mui/icons-material/Info';
import ConfigIcon from '@mui/icons-material/Settings';
import OverviewIcon from '@mui/icons-material/Visibility'; 
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

const drawerWidth = 240;

export default function Layout({ children }) {
  const [open, setOpen] = useState(false); // Initialize drawer state to closed
  const { session, logout } = useSession();
  const router = useRouter();
  const { activeUser, updateActiveUser } = useContext(ActiveUserContext);

  useEffect(() => {
    const fetchActiveUser = async () => {
      try {
        const response = await fetch('/api/session/getActiveUser', { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          updateActiveUser(data);
        }
      } catch (error) {
        console.error('Error fetching active user:', error);
      }
    };
    fetchActiveUser();
  }, []);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerOpen}
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Time Entry App - Beta Version
          </Typography>
          <Typography variant="subtitle1" noWrap sx={{ mr: 2 }}>
            {activeUser ? `Active User: ${activeUser}` : null}
          </Typography>
          {session.isLoggedIn && (
            <Typography variant="subtitle1" noWrap sx={{ mr: 2 }}>
              {session.username ? `Logged in as: ${session.username}` : null}
            </Typography>
          )}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="logout"
            onClick={(event) => {
              event.preventDefault();
              logout(null, { optimisticData: defaultSession });
              router.push('/LoginC');
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={open}
        onClose={handleDrawerClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItemButton component={Link} href="/" onClick={handleDrawerClose}>
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="Start Page" />
            </ListItemButton>
            <ListItemButton component={Link} href="/timeentry" onClick={handleDrawerClose}>
              <ListItemIcon><TimerIcon /></ListItemIcon>
              <ListItemText primary="Time Entry" />
            </ListItemButton>
            <ListItemButton component={Link} href="/config" onClick={handleDrawerClose}>
              <ListItemIcon><ConfigIcon /></ListItemIcon>
              <ListItemText primary="Configuration" />
            </ListItemButton>
            <ListItemButton component={Link} href="/overview" onClick={handleDrawerClose}>
              <ListItemIcon><OverviewIcon /></ListItemIcon>
              <ListItemText primary="Your Overview" />
            </ListItemButton>
            <ListItemButton component={Link} href="/employers" onClick={handleDrawerClose}>
              <ListItemIcon><BusinessCenterIcon /></ListItemIcon>
              <ListItemText primary="For Employers" />
            </ListItemButton>
            <ListItemButton component={Link} href="/about" onClick={handleDrawerClose}>
              <ListItemIcon><InfoIcon /></ListItemIcon>
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
          paddingTop: '0px',
          paddingLeft: '0px',
        }}
      >
        <Toolbar />
        <Box sx={{ margin: '20px' }}>
          {session.isLoggedIn ? children : <LoginC />}
        </Box>
      </Box>
    </Box>
  );
}
