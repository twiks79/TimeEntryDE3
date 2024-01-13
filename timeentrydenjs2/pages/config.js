/**
 * index.js
 * This file contains the main page component for the Time Entry application.
 * It imports necessary dependencies and components, defines card data for different categories,
 * and renders the appropriate components based on the user's session status.
 */

import React from 'react';

import { Button, CircularProgress, Typography, Container, Grid } from '@mui/material';
import NextLink from 'next/link';
import CategorySection from '../components/CategorySection';
import Link from '@mui/material/Link';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessIcon from '@mui/icons-material/Business';
import OvertimeIcon from '@mui/icons-material/AccessAlarms';
import VacationIcon from '@mui/icons-material/FlightTakeoff';

import useSession from "../utils/useSession";
import { defaultSession } from "../utils/lib";
import loginUser from '../utils/login/loginUser'
import LoginC from './LoginC';


export default function Config() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (session.isLoggedIn == false) {
    return (
      <LoginC />
    );
  }




  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Configuration
      </Typography>
      <Typography variant="body1" gutterBottom>
        This is the configuration page.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          {/* */}
        </Grid>
      </Grid>
    </Container>
  );

}