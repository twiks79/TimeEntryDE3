/**
 * setActiveUser.js
 * 
 *
 */

import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";
import { getTableClient } from '../../../utils/db/db';
import { getIronSession } from "iron-session";



/**
 * handler function
 * 
 * 
 * */

export default async function handler(req, res) {
    console.log('setActiveUser.js: handler()');

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
        

        const tableName = 'Session';
        const aPartitionKey = 'partition1';

        const updateEntity = {
            partitionKey: aPartitionKey,
            rowKey: username,
            Key: "ActiveUser",
            Value: data.Value,

        };
        const strObject = JSON.stringify(updateEntity);


        try {

            const client = getTableClient(tableName);
            console.log(`Updating row from table '${tableName}' with entity '${strObject}'.`);


            // update the entity in the table 'times' with replace
            const response = await client.updateEntity(updateEntity, 'Replace');

            console.log(`Updated row from table '${tableName}'.`);
            console.log(response);
            res.status(200).json(response);
        } catch (error) {
            console.error(`Error updating row from table '${tableName}'`, error);
            throw error;
        }
    } else {

        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
