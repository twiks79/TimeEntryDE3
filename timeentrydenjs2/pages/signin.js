// pages/signin.js
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    console.log('handleSubmit');
    event.preventDefault();
    // Attempt to sign in
    const result = await signIn('credentials', {
      username,
      password,
      callbackUrl: `${window.location.origin}` // redirect to this URL after sign in
    });

    if (result.error) {
      // Handle errors here
      console.error('Sign-in error:', result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit">Sign in</button>
    </form>
  );
}