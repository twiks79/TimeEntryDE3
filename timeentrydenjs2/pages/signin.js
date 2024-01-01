// pages/signin.js
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('handleSubmit');
    console.log('username', username, 'password', password);

    // Attempt to sign in
    const result = await signIn('credentials', {
      redirect: false, // Prevent NextAuth from redirecting automatically
      username,
      password,
      callbackUrl: `${window.location.origin}` // redirect to this URL after sign in
    });

    console.log('result.url', result.url);
    console.log('callbackUrl', `${window.location.origin}`);

    // Check if result.error exists and handle accordingly
    if (result.error) {
      console.error('Sign-in error:', result.error);
      // Handle error here, such as displaying a notification to the user
    } else {
      // Redirect the user to the callbackUrl if sign in was successful
      console.log('Sign-in successful', result.url);
      window.location.href = result.url;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit">Sign in</button>
    </form>
  );
}