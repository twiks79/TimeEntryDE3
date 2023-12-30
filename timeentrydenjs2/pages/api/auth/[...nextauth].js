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
      async authorize(credentials) {
        // You need to provide your own logic here for user validation
        console.log('credentials', credentials);

        const user = { id: 1, name: 'J Smith' };
        if (
          credentials &&
          credentials.username === 'jsmith' &&
          credentials.password === 'password123'
        ) {
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async session({ session, token }) {
      console.log('session', session);
      session.user.id = token.sub;
      // return session as json
      return session;
      // return session;
    },
    async jwt({ token, user }) {
      console.log('jwt', token);
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  secret: process.env.SECRET,
});