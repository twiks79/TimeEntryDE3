/**
 * delete_row.js
 * 
 *
 */

import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";
import { deleteTimeEntryRow } from '../../../utils/db/db';
import { getIronSession } from "iron-session";



/**
 * handler function
*/

export default async function handler(req, res) {
    console.log('delete_row.js: handler()');

    const session = await getIronSession(req, res, { password: process.env.SECRET_COOKIE_PASSWORD, cookieName: "timeentry" });
    if (!session.isLoggedIn) {
        return response.status(401).json({ error: 'Unauthorized' });
    }
    
    if (req.method === 'POST') {

        res.status(200).json(result);
    }
    res.status(405).json({ error: 'Method Not Allowed' });
}
