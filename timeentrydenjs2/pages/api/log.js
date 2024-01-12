import { getIronSession } from "iron-session";
import {
    defaultSession,
    sessionOptions,
    sleep,
} from "../../utils/lib";
import { loginUser } from '../../utils/login/loginUser';

// login
export default async function handler(request, response) {
    const session = await getIronSession(request, response, { password: process.env.SECRET_COOKIE_PASSWORD, cookieName: "timeentry" });
    console.log('Client logging to server');
    if (!session.isLoggedIn) {
        return response.status(401).json({ error: 'Unauthorized' });
    }
    if (request.method === "POST") {
        // log the body
        console.log('Client Log: ', request.body);
        // return a 200
        return response.status(200).json({ result: 'ok' });

    } else {

        return response.status(405).end(`Method ${request.method} Not Allowed`);
    }

}