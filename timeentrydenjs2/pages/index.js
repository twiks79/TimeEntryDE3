// pages/index.js

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button, CircularProgress, Typography, Container, Grid } from '@mui/material';
import Layout from '../components/Layout';
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

export default function Home() {
  const { data: session, status } = useSession();

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

  if (status === 'loading') {
    return (
      <Layout>
        <Container>
          <CircularProgress />
        </Container>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <Container>
          <Typography variant="body1" gutterBottom>
            You are not signed in.{' '}
            <NextLink href="/api/auth/signin" passHref>
              <Link>Sign in</Link>
            </NextLink>
          </Typography>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 1 }}>
        <CategorySection category="Category 1: Time Entry" cards={cardData.timeEntry} />
        <CategorySection category="Category 2: Configuration" cards={cardData.configuration} />
        <CategorySection category="Category 3: Overview" cards={cardData.overview} />
      </Container>
    </Layout>
  );
}