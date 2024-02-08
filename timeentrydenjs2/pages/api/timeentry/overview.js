/**
 * 
 * 
 *
 */

import { getIronSession } from "iron-session";
import { getTableClient } from '../../../utils/db/db';


export default async function handler(req, res) {
    console.log('overview.js');
    console.log(req);
    const aPartitionKey = 'partition1';
    // get username from session
    const session = await getIronSession(req, res, { password: process.env.SECRET_COOKIE_PASSWORD, cookieName: "timeentry" });
    console.log('session: ', session);
    let username = session.username;

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


    console.log('activeuser: ', ActiveUser);

    // map row to data object with id, date, hours, comment, username
    let data = {
            hoursPerMonth: 5,
            sickDays: 5,
            vacationDays: 5,
    };

    console.log('data', data);
    res.status(200).json(data);

};
