import * as React from 'react';
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
import InboxIcon from '@mui/icons-material/MoveToInbox';
import LogoutIcon from '@mui/icons-material/Logout';
import IconButton from '@mui/material/IconButton';
import MailIcon from '@mui/icons-material/Mail';
import HomeIcon from '@mui/icons-material/Home';
import TimerIcon from '@mui/icons-material/Timer';
import InfoIcon from '@mui/icons-material/Info';
import Link from 'next/link';
import { Icon } from '@mui/material';
import { signOut } from 'next-auth/react';
import { useSession } from "next-auth/react"

const drawerWidth = 240;

export default function Layout({ children }) {
  const [open, setOpen] = React.useState(true);

  const { data: session } = useSession();

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
            Time Entry App
          </Typography>

          {/* Show username */}
          {session && (
            <Typography variant="subtitle1" noWrap sx={{ mr: 2 }}>
              {session.user.name}
            </Typography>
          )}
          
          {/* Logout button */}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="logout"
            onClick={() => signOut()}
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
          {children}
        </Box>
      </Box>
    </Box>
  );
}
