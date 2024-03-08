/**
 * getActiveUser.js
 * 
 *
 */


import { dbGetActiveUser } from '../../../utils/db/db';
import { getIronSession } from "iron-session";

export default async function handler(req, res) {
    const session = await getIronSession(req, res, { password: process.env.SECRET_COOKIE_PASSWORD, cookieName: "timeentry" });

    console.log('getActiveUser.js');
    let ActiveUser = await dbGetActiveUser(session.username);

    res.status(200).json(ActiveUser);
};
