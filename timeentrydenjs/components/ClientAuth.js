// client-auth.js
'use client'

import { signIn, signOut, useSession } from "next-auth/react";

export default function ClientSideAuth() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (session) {
        return (
            <div>
                You have logged in <button onClick={() => signOut()}>Sign out</button>
            </div>
        );
    }

    return (
        <div>
            Not Logged In <button onClick={() => signIn()}>Sign in</button>
        </div>
    );
}
