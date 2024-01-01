// Import providers
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Options
const options = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = { id: "1", name: "ali", password: "ali123" };
        console.log('credentials', credentials);
        if (credentials?.username == user.name && credentials.password == user.password) {
          console.log('user login successful', user);
          return user;
        } else {
          return null;

        }
      }
    })
  ], secret: process.env.SECRET,
  pages: {
    // signIn: "/"
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('jwt', token);
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token, user }) {
      session.accessToken = token.accessToken
      console.log('session', session);
      return session
    }
  },
}

export default NextAuth(options);
