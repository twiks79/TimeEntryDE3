import { getIronSession } from "iron-session";
import {
  defaultSession,
  sessionOptions,
  sleep,
} from "../../utils/lib";
import { loginUser } from '../../utils/login/loginUser';

// logout
export default async function handler(request, response) {
// not sure if this is called
  console.log('logout');
  if (request.method === "POST") {

    return response.status(200).json({ result });

  } else {

    return response.status(405).end(`Method ${request.method} Not Allowed`);
  }

}