import { getIronSession } from "iron-session";
import {
  defaultSession,
  sessionOptions,
  sleep,
} from "../../utils/lib";
import { loginUser } from '../../utils/login/loginUser';
import { signupUser } from '../../utils/login/signupUser';

// signup
export default async function handler(request, response) {
  console.log('signup');
  if (request.method === "POST") {
    // get username and password
    const { username, password } = request.body;
    console.log('username', username);

    // call signupUser
    const resultSignUp = await signupUser(username, password);
    console.log('resultSignUp', resultSignUp);  

    // call loginUser
    const result = await loginUser(username, password);
    console.log('result', result);
   
    // save session
    const session = await getIronSession(request, response, { password: process.env.SECRET_COOKIE_PASSWORD, cookieName: "timeentry" });
    session.username = username;
    session.isLoggedIn = true;
    console.log('session', session);
    await session.save();
    console.log('session', session);
    return response.status(200).json({ result });

  } else {

    return response.status(405).end(`Method ${request.method} Not Allowed`);
  }

}