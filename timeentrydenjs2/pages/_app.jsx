import Layout from '../components/Layout';
import { useEffect } from 'react';
import logToServer from '../utils/lib';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';
import ActiveUserProvider, { useActiveUser } from '../components/ActiveUserContext'; // Import useActiveUser

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  useEffect(() => {
    logToServer('pages/_app.js ' + ' useEffect' + ' start');
  }, []);

  return (
    <SessionProvider session={session}>
      <ActiveUserProvider> {/* Wrap the component with ActiveUserProvider */}
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ActiveUserProvider> {/* Wrap the component with ActiveUserProvider */}
    </SessionProvider>
  );
}
