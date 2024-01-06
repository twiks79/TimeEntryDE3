/**
 * get_data.js
 */ 

import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";


export default async function handler(req, res) {
    const accountName = process.env.TIMEENTRYTABLES;
const accountKey = process.env.TIMEENTRYTABLES_KEY;
const connectionString = process.env.TIMEENTRYTABLES_CONNECTION;
const aPartitionKey = 'partition1'

    // get current user name from session
    const username = req.query.username;
    console.log('username', username);
    // create a test row
    const testRow = {
        PartitionKey: aPartitionKey,
        RowKey: 'test',
        date: '2021-10-01',
        hours: 8,
        comment: 'test',
        username: 'test'
    }

  const data = rows.map(row => ({
    id: row.RowKey,
    date: row.date,
    hours: row.hours,
    comment: row.comment,
    username: row.username  
  }));

  res.status(200).json(data);

}