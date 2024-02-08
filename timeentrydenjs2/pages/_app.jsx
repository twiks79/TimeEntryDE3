import Layout from '../components/Layout';
import ActiveUserProvider from '../components/ActiveUserContext';
import { useEffect } from 'react';
import logToServer from '../utils/lib';
import { SessionProvider } from 'next-auth/react'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  useEffect(() => {
    logToServer('pages/_app.js ' + ' useEffect' + ' start');
  }, []);

  return (
    <SessionProvider session={session}>
      <ActiveUserProvider>
        <Layout>

          <Component {...pageProps} />

        </Layout>
      </ActiveUserProvider>
    </SessionProvider>
  )
}