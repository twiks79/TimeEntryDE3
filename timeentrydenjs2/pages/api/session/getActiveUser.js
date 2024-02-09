/**
 * getActiveUser.js
 * 
 *
 */


import { getTableClient } from '../../../utils/db/db';
import { getIronSession } from 'iron-session';


export default async function handler(req, res) {

    console.log('session / getActiveUser.js: handler()');
    const aPartitionKey = 'partition1'

    const session = await getIronSession(req, res, { password: process.env.SECRET_COOKIE_PASSWORD, cookieName: "timeentry" });
    const username = session.username;
    
    console.log('username', username);

    const tableName = 'Session';
    const filter = `PartitionKey eq 'partition1' and RowKey eq '${username}'`;
    const queryOptions = { filter: filter };

    const client = getTableClient(tableName);

    console.log('Query Filter:', queryOptions); // Log the actual filter string

    const iterator = client.listEntities(queryOptions);

    let ActiveUser = '';

    for await (const entity of iterator) {
        if (entity.Key == "ActiveUser")
        {
            ActiveUser = entity.Value;
            break;
        }
    }

    console.log('Active User:', ActiveUser);

    res.status(200).json(ActiveUser);
};
