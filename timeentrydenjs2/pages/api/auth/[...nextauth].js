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

        const user2 = await loginUser(credentials.username, credentials.password);
        console.log('user2', user2);
        if (user2) {
          console.log('backend login successful');
          return { id: user2.name, name: user2.name };
        }

        // Replace this with your user authentication logic
      /*   const user = { id: 1, name: "ali", password: "ali123" };
        if (credentials && credentials.username === user.name && credentials.password === user.password) {
          console.log('authorization successful', user)
          // call loginUser from loginUser.js
          return { id: user.id, name: user.name };
        } */
        // If you return null or false then the credentials will be rejected
        console.log('authorization failed')
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
  pages: {
    signIn: '/LoginC', 
  },
};

export default NextAuth(options);