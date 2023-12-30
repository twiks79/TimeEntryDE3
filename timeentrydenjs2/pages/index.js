import Image from 'next/image';
import { Inter } from 'next/font/google';
import { useSession, sessionStatus, signIn } from 'next-auth/react';

const inter = Inter({ subsets: ['latin'] })




export default function Home() {
  const { data: session } = useSession()

  if (session) {
    return (
      <main>
        <div>
          <p>Already signed in as {session.user.email}</p>
          <button onClick={() => signOut()}>Sign out</button>
        </div>
      </main>
    )
  }

  return (
    <main>
      <div>
        <p>You are not signed in</p>
        <button onClick={() => signIn('okta')}>Sign in</button>

      </div>
    </main>
  )

}
