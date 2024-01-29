/**
 * get_data_employer.js
 * 
 *
 */


import { getTableClient } from '../../../utils/db/db';
import dayjs from 'dayjs';
import logToServer from '../../../utils/lib';

export default async function handler(req, res) {
    logToServer('employer / get_data_employer.js: handler()');

    const aPartitionKey = 'partition1'

    logToServer(req.query);

    const username = req.query.employer;
    logToServer('employer: ' + username);

    const tableName = 'employer';
    // difference: employer instead of employee
    const filter = `PartitionKey eq '${aPartitionKey}' and employer eq '${username}'`;
    const queryOptions = { filter: filter };

    try {

        const client = getTableClient(tableName);

        const iterator = client.listEntities(queryOptions);
        // from the result, get only the list of available employees
        


        const rows = [];

        for await (const entity of iterator) {
                const employee = entity.employee;
                logToServer('employee: ' + employee);
                rows.push(employee);
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
