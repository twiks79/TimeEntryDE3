import { getServerSession } from 'next-auth';
import { getSession, signIn, signOut } from 'next-auth/react';
import options from '@/pages/api/auth/[...nextauth]';

export default function Home({ session }) {
    console.log('TimeEntry Home');
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
    console.log('getServerSideProps session', session);
 

    if (!session) {
        // Redirect to the sign-in page if there is no session
        return {
            redirect: {
                destination: '/signin',
                permanent: false,
            },
        };
    }

    // If there is a session, return it as a prop to the page
    return {
        props: { session },
    };
}
