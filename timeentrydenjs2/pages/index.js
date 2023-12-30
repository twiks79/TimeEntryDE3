
import { useSession, getSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  console.log('home')
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('useEffect')
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <div>
      {session ? (
        // Render the dashboard UI
        <div>Welcome to your dashboard, {session.user.name}!</div>
      ) : (
        // Fallback if not signed in
        <div>You are not signed in.</div>
      )}
    </div>
    </main>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: '/signin',
        permanent: false,
      },
    };
  }
  return {
    props: { session },
  };
}