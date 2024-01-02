import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button, CircularProgress, Typography, Container, Link } from '@mui/material';
import Layout from '../components/Layout';
import NextLink from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();

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
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome {session.user.name}!
        </Typography>
        <Button variant="contained" color="primary" onClick={() => signOut()}>
          Sign out
        </Button>
      </Container>
    </Layout>
  );
}