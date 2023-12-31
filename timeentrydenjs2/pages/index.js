import { getSession, signIn, signOut } from 'next-auth/react';
import { useSession, useRouter } from 'next-auth/react';

export default function Home({ session }) {
  const router = useRouter();

  if(!session) {
    signIn();
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

  if(!session) {
    return {
      redirect: {
        destination: '/signin',
        permanent: false
      }
    }
  }

  return {
    props: {
      session 
    }
  }

}