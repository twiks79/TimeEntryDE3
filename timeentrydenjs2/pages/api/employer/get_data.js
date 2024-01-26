/**
 * get_data.js
 * 
 *
 */


import { getTableClient } from '../../../utils/db/db';
import dayjs from 'dayjs';

export default async function handler(req, res) {
    console.log('employer / get_data.js: handler()');

    const aPartitionKey = 'partition1'

    console.log(req.query);

    const username = req.query.user;
    console.log('username', username);

    const tableName = 'employer';
    const filter = `PartitionKey eq 'partition1' and employee eq '${username}'`;
    const queryOptions = { filter: filter };

    try {

        const client = getTableClient(tableName);

        console.log('Query Filter:', queryOptions); // Log the actual filter string

        const iterator = client.listEntities(queryOptions);

        const rows = [];

        for await (const entity of iterator) {
            // need to add a filter as i get all usernames
            if (entity.employee === username) {
                // convert startDate form dayjs to string
                entity.startDate = dayjs(entity.startDate).format('YYYY-MM-DD');
                entity.endDate = dayjs(entity.endDate).format('YYYY-MM-DD');
                rows.push(entity);
                console.log(entity);
            }
        }

        console.log(`Retrieved ${rows.length} rows from table '${tableName}' with filter '${queryOptions}'.`);

        console.log('rows', rows);

        const data = rows;

        console.log('data', data);
        res.status(200).json(data);
    } catch (error) {
        console.error(`Error retrieving rows from table '${tableName}' with filter '${queryOptions}':`, error);
        throw error; // rethrow the error after logging
    }

}
