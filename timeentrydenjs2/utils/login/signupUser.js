/**
 * loginUser.js
 * 
 */

import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";
import crypto from "crypto";


export async function signupUser(username, password) {
    console.log('signupUser');

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

    // Create the entity to insert
    const entity = {
        partitionKey: aPartitionKey,
        rowKey: username,
        password: hashedPassword,
    };

    try {
        // Insert the entity into the table
        const result = await tableClient.createEntity(entity);


        console.log('entity', entity);

        console.log('user signed up', entity);

        return entity;
    }

    catch (error) {
        console.error('Error accessing:', error);

    }
    // User is not found or password does not match
    console.log('user not found or password does not match');

    return false;
}