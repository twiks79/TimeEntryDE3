import { getSession, signIn, signOut } from 'next-auth/react';

export default function Home({ session }) {
  // You don't need useRouter here unless you're using it for other purposes.
  console.log('Home session', session);
  if (!session) {
    // If there is no session, the user will be redirected server-side to the sign-in page.
    // You don't need to call signIn() client-side.
    return <p>Loading...</p>;
  }

  return (
    <main>
      <p>Welcome {session.user.name}!</p>
      <button onClick={() => signOut()}>
        Sign out  
      </button>
    </main>
  );
}

// This function runs on the server for each request and can fetch the session
export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    // Redirect to the sign-in page if there is no session
    console.log('redirect to signin');
    return {
      redirect: {
        destination: '/signin',
        permanent: false,
      },
    };
  }

  console.log('live');
  // If there is a session, return it as a prop to the page
  return {
    props: { session },
  };
}


/* 'use client'

import { getSession, signIn, signOut } from 'next-auth/react';
import { useSession, useRouter } from 'next-auth/react';

export default function Home({ session }) {
  const router = useRouter();

  if(!session) {
    console.log('before signIn');
    signIn();
    console.log('after signIn');
    return <p>Loading...</p>;
  }

  return (
    <main>
      <p>Welcome {session.user.name}!</p>

      <button onClick={() => signOut()}>
        Sign out  
      </button>
    </main>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  console.log('index.js session', session);
  console.log('index.js context');
  if(!session) {
    return {
      redirect: {
        destination: '/signin',
        permanent: false
      }
    }
  }

  console.log('live');
  return {
    props: {
      session 
    }
  }

} */