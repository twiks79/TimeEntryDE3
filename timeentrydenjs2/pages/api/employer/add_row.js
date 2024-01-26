/**
 * add_row.js
 * 
 * This file is called from the front end and will add a row to the employer table
 * 
 * 
 * This file uses the following packages:
 *  @azure/data-tables: to connect to Azure Table Storage
 *
 */

import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";
import { addRowToTable } from '../../../utils/db/db';
import { getTableClient } from '../../../utils/db/db';
import { getIronSession } from "iron-session";
import { unstable_useId } from "@mui/material";
import { v4 as uuidv4 } from 'uuid';


/**
 * handler function
 * 
 * This function is the default export of the file and serves as the request handler for adding a row to the employer table.
 * 
 */

export default async function handler(req, res) {
    console.log('add_row.js: handler()');
    console.log('add_row.js: req.body: ', req.body);

    const session = await getIronSession(req, res, { password: process.env.SECRET_COOKIE_PASSWORD, cookieName: "timeentry" });
    const tableName = 'employer';

    if (!session.isLoggedIn) {
        return response.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'POST') {

        const data = req.body;
        console.log('add_row: data: ', data);

        const client = getTableClient(tableName);

        const entities = client.listEntities();

        for await (const tentity of entities) {
            Object.keys(tentity).forEach(key => console.log(`${key}: ${tentity[key]}`));
        }

        // rowkey will be uuid
        const entity = {
            PartitionKey: 'partition1',
            RowKey: uuidv4(),
            employer: data.employer,
            contractName:  data.contractName,
            startDate: data.startDate.toString(),
            endDate: data.endDate,
            hoursPerWeek: data.hoursPerWeek,
            compensationPerHour: data.compoensationPerHour,
            employee: data.employee
        };


        console.log(`Adding row to table '${tableName}' with data:`, entity);
        console.log('Property names:', Object.keys(entity), ' :' , Object.values(entity));
        const response = await client.createEntity(entity, );

        console.log(`Added row to table '${tableName}'.`);
        console.log(response);

        res.status(200).json(response);
    }


    res.status(405).json({ error: 'Method Not Allowed' });
}
