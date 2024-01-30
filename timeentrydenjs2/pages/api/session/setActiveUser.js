/**
 * setActiveUser.js
 * 
 *
 */

import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";
import { getTableClient } from '../../../utils/db/db';
import { getIronSession } from "iron-session";
import logToServer from "@/utils/lib";



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
        // get activeUser from URL
        const activeUser = req.query.user;
        console.log('activeUser', activeUser);  

        // get username from session
        const username = session.username;
        

        const tableName = 'Session';
        const aPartitionKey = 'partition1';

        const updateEntity = {
            partitionKey: aPartitionKey,
            rowKey: username,
            Key: "ActiveUser",
            Value: activeUser,

        };
        console.log('updateEntity', updateEntity);
        const strObject = JSON.stringify(updateEntity);


        try {

            const client = getTableClient(tableName);
            console.log(`Updating row from table '${tableName}' with entity '${strObject}'.`);


            // update the entity in the table 'times' with replace
            // if activeUser = '' then delete the entry
            let response;
            if (activeUser === '') {
                // delete the entry
                response = await client.deleteEntity(aPartitionKey, username);
            } else {
                // update the entry
                try {
                    response = await client.updateEntity(updateEntity, 'Replace');
                }
                // if error then create
                catch (error) {
                    console.log('error', error);
                    response = await client.createEntity(updateEntity);
                }
               
            }

            console.log(`Updated row from table '${tableName}'.`);
            console.log(response);
            res.status(200).json(response);
        } catch (error) {
            console.log(`Error updating row from table '${tableName}' ` +  error);
            throw error;
        }
    } else {

        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
