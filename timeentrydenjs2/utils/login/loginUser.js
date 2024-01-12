/**
 * loginUser.js
 * 
 */

import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";
import crypto from "crypto";


export async function loginUser(username, password) {


  const accountName = process.env.TIMEENTRYTABLES;
  const accountKey = process.env.TIMEENTRYTABLES_KEY;
  const connectionString = process.env.TIMEENTRYTABLES_CONNECTION;
  const aPartitionKey = 'partition1';

  // log the above constants in one statement
  console.log('accountName', accountName, 'accountKey', accountKey, 'connectionString', connectionString, 'aPartitionKey', aPartitionKey);
 
  // Check for required environment variables
  if (!accountName || !accountKey || !connectionString) {
    throw new Error("Environment variables for Azure Table Storage are not set");
  }

  // Create a sha256 hash of the password
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  // hashed_password = hashlib.sha256(password.encode()).hexdigest()

  console.log('username', username)
  console.log('hashedPassword', hashedPassword);

  // Create the table service client
  const credential = new AzureNamedKeyCredential(accountName, accountKey);
  console.log('credential', credential);

  let tableClient;
  try {
    // Create the table client for the 'users' table
    tableClient = TableClient.fromConnectionString(connectionString, 'users');
    console.log('tableClient', tableClient);
  } catch (error) {
    console.error('Error creating TableClient:', error);
    return false;
  }

  const queryOptions = { filter: `PartitionKey eq '${aPartitionKey}' and RowKey eq '${username}' and password eq '${hashedPassword}'` };
  try {
    const entities = tableClient.listEntities({
      queryOptions: queryOptions
    });
    console.log('queryOptions', queryOptions);
    console.log('entities', entities);
    // log number of entities found
    let count = 0;
    let authenticatedEntity = null; // Initialize the variable to store the authenticated entity
    for await (const entity of entities) {
      authenticatedEntity = entity; // Assign the current entity to the variable
      count++;
    }
    console.log(`Found ${count} entities`);
    if (count == 1) {
      // User is authenticated
      console.log('user authenticated', authenticatedEntity);

      return authenticatedEntity;
    }


    // User is not found or password does not match
    console.log('user not found or password does not match');
  } catch (error) {
    console.error('Error accessing:', error);

  }
  return false;
}