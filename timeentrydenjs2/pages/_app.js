import Layout from '../components/Layout';
import { useEffect } from 'react';
import logToServer from '../utils/lib';
import { SessionProvider } from 'next-auth/react'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  useEffect(() => {
    logToServer('pages/_app.js', 'useEffect', 'start');
  }, []);

  return (
    <SessionProvider session={session}>
      <Layout>

          <Component {...pageProps} />

      </Layout>
    </SessionProvider>
  )
}