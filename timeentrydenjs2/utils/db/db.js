/**
 * db.js
 * This file contains the functions to connect to Azure Table Storage
 * It uses the following environment variables:
 *  TIMEENTRYTABLES: the name of the Azure Table Storage account
 *  TIMEENTRYTABLES_KEY: the key for the Azure Table Storage account
 *  TIMEENTRYTABLES_CONNECTION: the connection string for the Azure Table Storage account
 * 
 * This file uses the following packages:
 *  @azure/data-tables: to connect to Azure Table Storage
 *
 */

import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";
import { v4 as uuidv4 } from 'uuid';


// Helper function to create a URL from the account name
function createTableServiceClientUrl(accountName) {
    return `https://${accountName}.table.core.windows.net`;
}

// implement getTableClient that returns a TableClient for a given table name
export function getTableClient(tableName) {
    try {
        const accountName = process.env.TIMEENTRYTABLES;
        const accountKey = process.env.TIMEENTRYTABLES_KEY;

        if (!accountName || !accountKey) {
            throw new Error('Environment variables for Azure Table Storage account name and key are not set properly.');
        }

        // Create a URL using the helper function
        const url = createTableServiceClientUrl(accountName);
        const credential = new AzureNamedKeyCredential(accountName, accountKey);

        // Use the URL and credentials to create the TableClient
        const client = new TableClient(url, tableName, credential);
        console.log(`TableClient for table '${tableName}' has been created.`);
        return client;
    } catch (error) {
        console.error('Error getting TableClient:', error);
        throw error; // rethrow the error after logging
    }
}

// implement getRows that returns all rows from a given table
export async function getRows(tableName) {
    try {
        const client = getTableClient(tableName);
        const iterator = client.listEntities();
        const rows = [];
        for await (const entity of iterator) {
            rows.push(entity);
        }
        console.log(`Retrieved ${rows.length} rows from table '${tableName}'.`);
        return rows;
    } catch (error) {
        console.error(`Error retrieving rows from table '${tableName}':`, error);
        throw error; // rethrow the error after logging
    }
}


// implement getRowsFromTable that returns rows for a given table with a given filter
export async function getRowsFromTable(tableName, filter) {
    try {
        const client = getTableClient(tableName);
        const queryOptions = {
            filter: filter
        };
        console.log('queryOptions', queryOptions);
        const iterator = client.listEntities(queryOptions);
        const rows = [];
        for await (const entity of iterator) {
            console.log('entity', entity);
            rows.push(entity);
        }
        console.log(`Retrieved ${rows.length} rows from table '${tableName}' with filter '${filter}'.`);
        return rows;
    } catch (error) {
        console.error(`Error retrieving rows from table '${tableName}' with filter '${filter}':`, error);
        throw error; // rethrow the error after logging
    }
}

/**
 * 
 * @param {*} tableName 
 * @param {*} row
 * The row should have the following properties:
 * date: the date of the time entry
 * hours: the number of hours for the time entry 
 * comment: the comment for the time entry
 * type: the type of the time entry: 'Time Entry', 'Sick Leave', 'Vaccation'
 * @returns row
 * The row will have the following properties:
 * id: the RowKey from Azure Table Storage
 * rest same as row
 */
export async function addRowToTable(tableName, row) {
    try {


        const client = getTableClient(tableName);
        // create a row for the table and map the fields from the data
        // and generate a UUID for the RowKey
        // get username from session
        const entity = {
            PartitionKey: 'partition1',
            RowKey: uuidv4(),
            date: row.date,
            hours: row.hours,
            comment: row.comment,
            type: row.type,
            username: row.username,
        };
        console.log(`Adding row to table '${tableName}' with data:`, entity);
        const response = await client.createEntity(entity);
        console.log(`Added row to table '${tableName}'.`);
        console.log(response);

        return entity;
    } catch (error) {
        console.error(`Error adding row to table '${tableName}':`, error);
        throw error; // rethrow the error after logging
    }
}