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
import getironSession from 'next-iron-session';
import logToServer from "../lib";



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

export async function getEmployerForUsername(username) {

    const tableName = 'employer';
    const filter = `PartitionKey eq 'partition1'`// and RowKey eq '${username}'`;
    const queryOptions = { filter: filter };

    try {

        const client = getTableClient(tableName);

        console.log('Query Filter:', queryOptions); // Log the actual filter string

        const iterator = client.listEntities(queryOptions);

        const rows = [];

        for await (const entity of iterator) {
            // need to add a filter as i get all usernames
            if (entity.rowKey === username) rows.push(entity);
            console.log(entity);
        }

        console.log(`Retrieved ${rows.length} rows from table '${tableName}' with filter '${queryOptions}'.`);

        return rows;
    } catch (error) {
        console.error(`Error retrieving rows from table '${tableName}' with filter '${queryOptions}':`, error);
        throw error; // rethrow the error after logging
    }
}

// implement getTimeEntryRowsForUsername that returns rows for a given table with a given filter
export async function getTimeEntryRowsForUsername(username) {
    const tableName = 'times';

    try {

        const client = getTableClient(tableName);

        const filter = `PartitionKey eq 'partition1' and Username eq '${username}'`; // Make sure property names are correctly cased

        const queryOptions = { filter: filter };
        console.log('Query Filter:', queryOptions.filter); // Log the actual filter string

        const iterator = client.listEntities(queryOptions);

        const rows = [];

        for await (const entity of iterator) {
            // need to add a filter as i get all usernames
            if (entity.username === username) rows.push(entity);
        }

        console.log(`Retrieved ${rows.length} rows from table '${tableName}' with filter '${queryOptions}'.`);

        return rows;
    } catch (error) {
        console.error(`Error retrieving rows from table '${tableName}' with filter '${queryOptions}':`, error);
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

// deleteTimeEntryRow
// implement deleteTimeEntryRow that deletes a row from the times table
export async function deleteTimeEntryRow(id) {
    const tableName = 'times';
    const aPartitionKey = 'partition1';

    try {

        const client = getTableClient(tableName);
        console.log(`Deleting row from table '${tableName}' with id '${id}'.`);

        const response = await client.deleteEntity(aPartitionKey, id);

        console.log(`Deleted row from table '${tableName}'.`);
        console.log(response);
        return response;
    } catch (error) {
        console.error(`Error deleting row from table '${tableName}' with id '${id}':`, error);
        throw error; // rethrow the error after logging
    }
}

// deleteTimeEntryRow
// implement deleteTimeEntryRow that deletes a row from the times table
export async function updateTimesRow(delEntity) {
    const tableName = 'times';
    const aPartitionKey = 'partition1';
    const updateEntity = {
        partitionKey: aPartitionKey,
        rowKey: delEntity.id,
        date: delEntity.date,
        hours: delEntity.hours,
        comment: delEntity.comment,
        type: delEntity.type,
        username: delEntity.username,
    };
    const strObject = JSON.stringify(updateEntity);


    try {

        const client = getTableClient(tableName);
        console.log(`Updating row from table '${tableName}' with entity '${strObject}'.`);


        // update the entity in the table 'times' with replace
        const response = await client.updateEntity(updateEntity, 'Replace');

        console.log(`Updated row from table '${tableName}'.`);
        console.log(response);
        return response;
    } catch (error) {
        console.error(`Error updating row from table '${tableName}'`, error);
        throw error;
    }
}
