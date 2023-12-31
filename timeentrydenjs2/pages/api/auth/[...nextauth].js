import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';


export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials, req) {
        // You need to provide your own logic here for user validation
        console.log('credentials', credentials);
        // console.log('req', req);

        const user = { id: 1, name: 'J Smith' };
        if (
          credentials &&
          credentials.username === 'jsmith' &&
          credentials.password === 'password123'
        ) {
          console.log('user login successful', user);
          return user;
        } else {
          return null;
        }
      },
    }),
  ],

  secret: process.env.SECRET,

  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },

    async session({ session, token }) {
      // log timestamp
      console.log('session', session);
      // console.log('timestamp', new Date().toISOString());

      // session.user.id = token.sub;
      // return session as json
      return session;
    },


    async jwt({ token, user }) {
      console.log('jwt', token);
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  
  pages: {
    signIn: '/signin',
  }

});