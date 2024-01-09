/**
 * get_data.js
 * 
 * This file is called from the front end to get the data from the Azure Table Storage
 * It should return only the rows for the current user
 * 
 * The username is passed in the query string
 * 
 * The data is returned as an array of objects with the following properties:
 *  id: the RowKey from Azure Table Storage
 *  date: the date of the time entry
 *  hours: the number of hours for the time entry
 *  comment: the comment for the time entry
 *  username: the username for the user that created the time entry
 * 
 * The data is returned as a JSON object
 * 
 * This file uses the following packages:
 *  @azure/data-tables: to connect to Azure Table Storage
 *
 */

import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";
import { getRowsFromTable } from '../../../utils/db/db';


export default async function handler(req, res) {

  const aPartitionKey = 'partition1'

  console.log(req.query);

  // get current user name from session
  // get username from query string
  const username = req.query.username;
  console.log('username', username);


  // filter for Partition key and username
  const filter = `PartitionKey eq '${aPartitionKey}' and username eq '${username}'`;

  const rows = await getRowsFromTable('times', filter);
  
  console.log('rows', rows);
  // map row to data object with id, date, hours, comment, username
  const data = rows.map(row => {
    return {
      id: row.RowKey,
      date: row.date,
      hours: row.hours,
      comment: row.comment,
      username: row.username
    }
  });

  console.log('data', data);
  res.status(200).json(data);

}
