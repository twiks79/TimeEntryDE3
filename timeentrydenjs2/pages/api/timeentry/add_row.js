/**
 * get_row.js
 * 
 * This file is called from the front end and will add a row to the times table
 * 
 * The username is passed in the query string
 * 
 * The data provided has the following properties:
 *  id: the RowKey from Azure Table Storage
 *  date: the date of the time entry
 *  hours: the number of hours for the time entry
 *  comment: the comment for the time entry
 *  username: the username for the user that created the time entry
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
 * It handles POST requests and expects the following data in the request body:
 *  - date: the date of the time entry
 *  - hours: the number of hours for the time entry
 *  - comment: the comment for the time entry
 *  - type: the type of the time entry
 * 
 * The function adds the row to the table and returns the same data with the added id.
 */

export default async function handler(req, res) {
    const session = await getIronSession(req, res, { password: process.env.SECRET_COOKIE_PASSWORD, cookieName: "timeentry" });
    if (!session.isLoggedIn) {
        return response.status(401).json({ error: 'Unauthorized' });
    }
    
    if (req.method === 'POST') {
        console.log('POST');
        console.log(req.body);
        console.log(req.headers);
        const data = req.body;
   
        data.username = session.username;
        console.log('add_row: data: ', data);

        const result = await addRowToTable('times', data);

        console.log('result', result);
        res.status(200).json(result);
    }
    res.status(405).json({ error: 'Method Not Allowed' });
}
