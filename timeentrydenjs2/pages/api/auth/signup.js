/**
 * signup.js
 * Implementation of the signup API endpoint
 * It takes username and password from the request body
 * it connects to the Azure Table Storage and creates a new user in the Table users with
 * PartitionKey = Partition1, RowKey = username, password = hashedPassword
 */
import crypto from "crypto";
import { AzureNamedKeyCredential, TableClient } from "@azure/data-tables";

export default async function handler(req, res) {
  const accountName = process.env.TIMEENTRYTABLES;
  const accountKey = process.env.TIMEENTRYTABLES_KEY;
  const connectionString = process.env.TIMEENTRYTABLES_CONNECTION;
  const localPartitionKey = 'partition1';
  
    // Check for required environment variables
  if (!accountName || !accountKey || !connectionString) {
    res.status(500).json({ error: "Environment variables for Azure Table Storage are not set" });
    return;
  }

  // Create a sha256 hash of the password
  const hashedPassword = crypto.createHash('sha256').update(req.body.password).digest('hex');

  // Create the table service client
  const credential = new AzureNamedKeyCredential(accountName, accountKey);
  let tableClient;
  try {
    // Create the table client for the 'users' table
    tableClient = TableClient.fromConnectionString(connectionString, 'users');
  } catch (error) {
    console.error('Error creating TableClient:', error);
    res.status(500).json({ error: "Error creating TableClient" });
    return;
  }

  try {
    // Insert the new user into the table
    const entity = {
      PartitionKey: localPartitionKey,
      RowKey: req.body.username,
      password: hashedPassword
    };
    
    console.log('entity', entity);
    await tableClient.createEntity(entity);
    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    if (error.code === "EntityAlreadyExists") {
      res.status(409).json({ error: "User already exists" });
    } else {
      console.error('Error inserting user:', error);
      res.status(500).json({ error: "Error inserting user" });
    }
  }
}
