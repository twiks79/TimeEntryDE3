/**
 * get_data.js
 * 
 *
 */


import { getTimeEntryRowsForUsername } from '../../../utils/db/db';


export default async function handler(req, res) {
  console.log('get_data.js: handler()');

  const aPartitionKey = 'partition1'

  console.log(req.query);

  // get current user name from session
  // get username from query string
  const username = req.query.user2;
  console.log('user2', username);


  // filter for Partition key and username
  const filter = `PartitionKey eq '${aPartitionKey}' and username eq '${username}'`;
  const regex = /^[a-zA-Z0-9]+ eq |\bg[te] /;
  console.log('test: ', regex.test(filter));
  const rows = await getEmployerForUsername(username);

  console.log('rows', rows);
  // map row to data object with id, date, hours, comment, username
  const data = rows.map(row => {
    return {

    }
  });

  console.log('data', data);
  res.status(200).json(data);

}
