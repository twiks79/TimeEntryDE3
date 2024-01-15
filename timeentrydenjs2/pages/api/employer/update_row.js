/**
 * update_row.js
 * 
 *
 */

import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";
import { addRowToTable } from '../../../utils/db/db';
import { updateTimesRow } from '../../../utils/db/db';
import { getIronSession } from "iron-session";



/**
 * handler function
 * 
 * 
 * */

export default async function handler(req, res) {
    console.log('update_row.js: handler()');
    
    const session = await getIronSession(req, res, { password: process.env.SECRET_COOKIE_PASSWORD, cookieName: "timeentry" });
    if (!session.isLoggedIn) {
        return response.status(401).json({ error: 'Unauthorized' });
    }
    
    if (req.method === 'POST') {
        console.log('Update Row POST');
        console.log(req.body);
        console.log(req.headers);
        
        const data = req.body;
   
        data.username = session.username;
        console.log('add_row: data: ', data);

        const result = await updateTimesRow(data);

        console.log('result', result);
        res.status(200).json(result);
    }
    res.status(405).json({ error: 'Method Not Allowed' });
}
