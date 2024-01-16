/**
 * get_data.js
 * 
 *
 */


import { getEmployerForUsername } from '../../../utils/db/db';

export default async function handler(req, res) {
  console.log('get_data.js: handler()');

  const aPartitionKey = 'partition1'

  console.log(req.query);

  // get current user name from session
  // get username from query string
  const username = req.query.user2;
  console.log('user2', username);

  const rows = await getEmployerForUsername(username);

  console.log('rows', rows);
  // map row to data object with id, date, hours, comment, username
  const data = rows;

  console.log('data', data);
  res.status(200).json(data);

}
