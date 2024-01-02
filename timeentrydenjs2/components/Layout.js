import * as React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import Drawer from '@mui/material/Drawer';
import TimerIcon from '@mui/icons-material/Timer';
import LogoutIcon from '@mui/icons-material/Logout';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

const drawerWidth = 240;

function Layout({ children }) {
    const drawer = (
        <div>
            <List>
                <ListItemButton component={Link} href="/timeentry">
                    <ListItemIcon>
                        <TimerIcon />
                    </ListItemIcon>
                    <ListItemText primary="Time Entry" />
                </ListItemButton>
            </List>
            <Divider />
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Time Entry App
                    </Typography>
                    <IconButton
                        color="inherit"
                        edge="end"
                        onClick={() => signOut()}
                    >
                        <LogoutIcon />
                        <Typography variant="body1" noWrap sx={{ ml: 1 }}>
                            Logout
                        </Typography>
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
            >
                <Drawer
                    variant="permanent"
                    sx={{
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}

export default Layout;