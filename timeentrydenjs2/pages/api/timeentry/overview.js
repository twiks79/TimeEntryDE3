import { getIronSession } from "iron-session";
import { getTableClient } from '../../../utils/db/db';
import { getTimeEntryRowsForUsername } from "../../../utils/db/db";
import { dbGetActiveUser } from '../../../utils/db/db';

/*
Data Structure from Database:
- entry: {Object} - Represents a single entry from the database.
    - etag: {string} - ETag of the entry.
    - partitionKey: {string} - Partition key of the entry.
    - rowKey: {string} - Row key of the entry.
    - timestamp: {string} - Timestamp of the entry.
    - date: {string} - Date of the entry.
    - hours: {string} - Hours worked or number of vacation/sick days.
    - type: {string} - Type of entry (e.g., "Time Entry", "Sick Leave", "Vacation Day").
    - username: {string} - Username associated with the entry.
*/

async function handler(req, res) {
    console.log('overview.js');

    const aPartitionKey = 'partition1';
    
    const session = await getIronSession(req, res, { password: process.env.SECRET_COOKIE_PASSWORD, cookieName: "timeentry" });
    console.log('session: ', session);
    let username = await dbGetActiveUser(session.username);

    const tableName = 'Session';
    const filter = `PartitionKey eq 'partition1' and RowKey eq '${username}'`;
    const queryOptions = { filter: filter };

    const client = getTableClient(tableName);
    console.log('Query Filter:', queryOptions);

    const iterator = client.listEntities(queryOptions);
    let ActiveUser = '';

    for await (const entity of iterator) {
        if (entity.Key == "ActiveUser") {
            ActiveUser = entity.Value;
            break;
        }
    }
    
    console.log('activeuser: ', ActiveUser);
    const timeEntryRows = await getTimeEntryRowsForUsername(ActiveUser);
    console.log('timeEntryRows: ', timeEntryRows);

    const data = await calculateWeeklyStats(timeEntryRows);


    console.log('data', data);
    res.status(200).json(data);
}

async function calculateWeeklyStats(timeEntries) {

    const currentYear = new Date().getFullYear();
    let weeklyStats = {};
    let totalVacationDays = 0;
    let totalSickDays = 0;

    timeEntries.forEach(entry => {
        console.log('entry: ', entry);
        if (new Date(entry.date).getFullYear() === currentYear) {
            const weekNumber = getWeekNumber(new Date(entry.date));
            if (!weeklyStats[weekNumber]) {
                weeklyStats[weekNumber] = { hours: 0, sickDays: 0, vacationDays: 0 };
            }
            if (entry.type === 'Sick Leave') {
                weeklyStats[weekNumber].sickDays += 1;
                totalSickDays += 1;
            } else if (entry.type === 'Vacation Day') {
                weeklyStats[weekNumber].vacationDays += 1;
                totalVacationDays += 1;
            } else {
                weeklyStats[weekNumber].hours += parseFloat(entry.hours);
            }
        }
    });

    return { weeklyStats, totalVacationDays, totalSickDays };
}

// Helper function to get week number
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export default handler;
