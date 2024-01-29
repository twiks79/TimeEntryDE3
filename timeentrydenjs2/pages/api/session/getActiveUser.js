/**
 * getActiveUser.js
 * 
 *
 */


import { getTableClient } from '../../../utils/db/db';


export default async function handler(req, res) {
    
    console.log('employer / getActiveUser.js: handler()');
    const aPartitionKey = 'partition1'

    const username = req.query.user;
    console.log('username', username);

    const tableName = 'Session';
    const filter = `PartitionKey eq 'partition1' and RowKey eq '${username}'`;
    const queryOptions = { filter: filter };

    try {

        const client = getTableClient(tableName);

        console.log('Query Filter:', queryOptions); // Log the actual filter string

        const iterator = client.listEntities(queryOptions);

        let ActiveUser = '';

        for await (const entity of iterator) {
                if (entity.Key == "ActiveUser") then
                {
                    ActiveUser = entity.Value;
                    break;
                }
            }
        }

        console.log(`Retrieved ${rows.length} rows from table '${tableName}' with filter '${queryOptions}'.`);

        console.log('Active User:', ActiveUser);

        res.status(200).json(ActiveUser);
    } catch (error) {
        console.error(`Error retrieving rows from table '${tableName}' with filter '${queryOptions}':`, error);
        throw error; // rethrow the error after logging
    }

}
