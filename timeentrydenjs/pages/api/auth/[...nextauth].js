// app/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import OktaProvider from 'next-auth/providers/okta';

console.log('OKTA_CLIENT_ID:', process.env.OKTA_CLIENT_ID);
console.log('OKTA_CLIENT_SECRET:', process.env.OKTA_CLIENT_SECRET);
console.log('OKTA_DOMAIN:', process.env.OKTA_DOMAIN);

export default NextAuth({
  providers: [
    OktaProvider({
      clientId: process.env.OKTA_CLIENT_ID,
      clientSecret: process.env.OKTA_CLIENT_SECRET,
      issuer: `https://${process.env.OKTA_DOMAIN}/oauth2/default`,
      authorizationParams: {
        response_type: 'code',
        code_challenge_method: 'S256',
      },
    }),
    // ...other providers if needed
  ],
  secret: process.env.SECRET,
  
  // Additional NextAuth.js configurations...

  callbacks: {
    /**
     * This function is called whenever a user signs in.
     * You can add custom logic here, such as logging user sign-ins.
     * @param {object} user - User object
     * @param {object} account - Account object
     * @param {object} profile - Profile object
     * @returns {Promise<boolean>}
     */
    async signIn(user, account, profile) {
      // Log user sign-in
      console.log(`User signed in: ${user.email}`);

      // You can add custom logic here if needed

      return true; // Return true to allow sign-in
    },

    /**
     * This function is called whenever a session is created.
     * You can add custom logic here, such as logging session creation.
     * @param {object} session - Session object
     * @param {object} user - User object
     * @returns {Promise<object>}
     */
    async session(session, user) {
      // Log session creation
      console.log(`Session created for user: ${user.email}`);

      // You can add custom logic here if needed

      return session;
    },

    /**
     * This function is called whenever a session is destroyed.
     * You can add custom logic here, such as logging session destruction.
     * @param {object} session - Session object
     * @returns {Promise<object>}
     */
    async session(session) {
      // Log session destruction
      console.log(`Session destroyed for user: ${session.user.email}`);

      // You can add custom logic here if needed

      return session;
    },
  },
});
