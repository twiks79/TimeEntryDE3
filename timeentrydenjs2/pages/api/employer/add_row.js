/**
 * add_row.js
 * 
 * This file is called from the front end and will add a row to the times table
 * 
 * The username is passed in the query string
 * 
 * 
 * This file uses the following packages:
 *  @azure/data-tables: to connect to Azure Table Storage
 *
 */

import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";
import { addRowToTable } from '../../../utils/db/db';
import { getIronSession } from "iron-session";



/**
 * handler function
 * 
 * This function is the default export of the file and serves as the request handler for adding a row to the times table.

 * 
 * The function adds the row to the table and returns the same data with the added id.
 */

export default async function handler(req, res) {
    console.log('add_row.js: handler()');
    
    const session = await getIronSession(req, res, { password: process.env.SECRET_COOKIE_PASSWORD, cookieName: "timeentry" });
    if (!session.isLoggedIn) {
        return response.status(401).json({ error: 'Unauthorized' });
    }
    
    if (req.method === 'POST') {

        res.status(200).json(result);
    }
    res.status(405).json({ error: 'Method Not Allowed' });
}
