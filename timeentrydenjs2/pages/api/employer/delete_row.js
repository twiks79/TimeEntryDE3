/**
 * delete_row.js
 * 
 *
 */

import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";
import { deleteTimeEntryRow } from '../../../utils/db/db';
import { getIronSession } from "iron-session";
import { getTableClient } from '../../../utils/db/db';



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
        const data = req.body;

        console.log('delete_row: data: ', data);
        const tableName = 'employer';
        const aPartitionKey = 'partition1';

        try {

            const client = getTableClient(tableName);
            console.log(`Deleting row from table '${tableName}' with rowKey '${data.rowKey}'.`);

            const response = await client.deleteEntity(aPartitionKey, data.rowKey);

            console.log(`Deleted row from table '${tableName}'.`);
            console.log(response);
            res.status(200).json(response);
        } catch (error) {
            console.error(`Error deleting row from table '${tableName}' with rowKey '${data.rowKey}':`, error);
            throw error; // rethrow the error after logging
        }
    }
    res.status(405).json({ error: 'Method Not Allowed' });
};
