import { getIronSession } from "iron-session";
import {
    defaultSession,
    sessionOptions,
    sleep,
} from "../../utils/lib";
import { loginUser } from '../../utils/login/loginUser';

// login
export default async function handler(request, response) {

    if (request.method === "POST") {
        // get username and password
        const { username, password } = request.body;
        console.log('username', username);

        // call loginUser
        const result = await loginUser(username, password);
        console.log('result', result);

        // save session
        const session = await getIronSessi on(request, response, { password: process.env.SECRET_COOKIE_PASSWORD, cookieName: "timeentry" });
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