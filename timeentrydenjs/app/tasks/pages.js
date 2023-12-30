import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useSession, signIn, signOut } from 'next-auth/react';


export default function TasksPage() {

  const { data: session } = useSession();

  if (session) {
    return (
      <>
        Signed in as {session.user.email}
        <button onClick={() => signOut()}>Sign out</button>


        <Container>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography variant="body1" gutterBottom>
              Tasks Page
            </Typography>
          </Box>
        </Container>
      </>
    );
  }
  return (
    <>
      Not signed in
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}