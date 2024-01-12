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


export default function Home() {
  const { session, isLoading } = useSession();

  const cardData = {
    timeEntry: [
      {
        title: 'Add Working Time',
        icon: <AccessTimeIcon />,
        additionalText: 'Log your working hours',
        link: '#'
      },
      {
        title: 'Add Sick Day',
        icon: <LocalHospitalIcon />,
        additionalText: 'Report a sick leave',
        link: '#'
      },
      {
        title: 'Add Vacation Day',
        icon: <BeachAccessIcon />,
        additionalText: 'Plan your vacation',
        link: '#'
      },
    ],
    configuration: [
      {
        title: 'Define Contract',
        icon: <DescriptionIcon />,
        additionalText: 'Set up your work contract details',
        link: '#'
      },
      {
        title: 'Assign Employer',
        icon: <BusinessIcon />,
        additionalText: 'Set your employer information',
        link: '#'
      },
    ],
    overview: [
      {
        title: 'Get Overtime Overview',
        icon: <OvertimeIcon />,
        additionalText: 'See overtime balances',
        link: '#'
      },
      {
        title: 'Get Vacation Overview',
        icon: <VacationIcon />,
        additionalText: 'Check your vacation status',
        link: '#'
      },
    ],
  };

  if (isLoading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (session.isLoggedIn == false) {
    return (
      <Container>
        <Typography variant="h4" sx={{ mt: 2 }}>Welcome to Time Entry</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>Please sign in to continue.</Typography>
        <NextLink href="/LoginC" passHref>
          <Link>
            <Button variant="contained">Sign In</Button>
          </Link>
        </NextLink>
      </Container>

    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 1 }}>
      <CategorySection category="Category 1: Time Entry" cards={cardData.timeEntry} />
      <CategorySection category="Category 2: Configuration" cards={cardData.configuration} />
      <CategorySection category="Category 3: Overview" cards={cardData.overview} />
    </Container>

  );
}