import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const options = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Replace this with your user authentication logic
        const user = { id: 1, name: "ali", password: "ali123" };
        if (credentials && credentials.username === user.name && credentials.password === user.password) {
          console.log('authorization successful', user)
          return { id: user.id, name: user.name };
        }
        // If you return null or false then the credentials will be rejected
        return null;
        // You can also throw an error to reject the credentials
        // throw new Error('some error')
      },
    }),
  ],
  // If you want to use database sessions instead of JWT, uncomment the following line
  // session: { strategy: "database" },
  // If you need a custom sign-in page, uncomment the following line
  // pages: { signIn: '/auth/signin' },
};

export default NextAuth(options);