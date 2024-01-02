// utils/authenticate.js
import { TableClient, TableServiceClient, AzureNamedKeyCredential } from "@azure/data-tables";
import crypto from "crypto";

const accountName = process.env.TIMEENTRYTABLES;
const accountKey = process.env.TIMEENTRYTABLES_KEY;
const connectionString = process.env.TIMEENTRYTABLES_CONNECTION;

export async function loginUser(username, password) {
  // Check for required environment variables
  if (!accountName || !accountKey || !connectionString) {
    throw new Error("Environment variables for Azure Table Storage are not set");
  }

  // Create a sha256 hash of the password
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  console.log('username', username)
  console.log('hashedPassword', hashedPassword);

  // Create the table service client
  const credential = new AzureNamedKeyCredential(accountName, accountKey);
  console.log('credential', credential);
  const tableServiceClient = new TableServiceClient(connectionString, credential);
  console.log('tableServiceClient', tableServiceClient);


  try {
    // Check if user is available in Azure Tables
    // const tableClient = tableServiceClient.getTableClient('users');
    const tableClient = TableClient.fromConnectionString(connectionString, 'users');
    console.log('tableClient', tableClient);
  } catch (error) {
    console.error('Error accessing TableClient:', error);
    return false;
  }

  try {
  const entities = tableClient.listEntities({
    queryOptions: { filter: `RowKey eq '${username}'` }
  });
  }
  catch (error) {
    console.error('Error accessing listEntities:', error);
    return false;
  }
  console.log('entities', entities);

  for await (const entity of entities) {
    if (entity.RowKey === username && entity.password === hashedPassword) {
      // User is authenticated
      console.log('user authenticated', entity);
      return true;
    }
  }

  // User is not found or password does not match
  console.log('user not found or password does not match');
  return false;
}