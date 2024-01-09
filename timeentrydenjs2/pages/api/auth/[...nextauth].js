import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginUser } from "../../../utils/login/loginUser";

const options = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await loginUser(credentials.username, credentials.password);

        if (user) {
          console.log('successful login user', user)
          return user;
        }

        return null;
      }
    })
  ],

  session: {
    jwt: true,
  },

  pages: {
    signIn: '/LoginC'
  },

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {

      console.log('signIn', user, account, profile, email, credentials);
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('redirect', url, baseUrl);
      return baseUrl;
    },
    async session({ session, user, token }) {
      console.log('session', session, token);
      session.user.name = token.name; // Here you should access the name from the token, not from the user
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      console.log('jwt', token, user)
      if (user) {
        console.log('user', user);
        token.name = user.rowKey; // Set the token name only if the user exists
      }
      return token;
    }
  }
};

export default NextAuth(options);