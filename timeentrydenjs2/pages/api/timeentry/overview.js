import { getIronSession } from "iron-session";
import { getTableClient } from '../../../utils/db/db';
import { getTimeEntryRowsForUsername } from "../../../utils/db/db";

async function handler(req, res) {
    console.log('overview.js');
    console.log(req);
    const aPartitionKey = 'partition1';
    
    const session = await getIronSession(req, res, { password: process.env.SECRET_COOKIE_PASSWORD, cookieName: "timeentry" });
    console.log('session: ', session);
    let username = session.username;

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
    let totalVacationDays = 0; // Assuming totalVacationDays is a fixed value or calculated elsewhere
    let usedVacationDays = 0;

    timeEntries.forEach(entry => {
        if (new Date(entry.date).getFullYear() === currentYear) {
            const weekNumber = getWeekNumber(new Date(entry.date));
            if (!weeklyStats[weekNumber]) {
                weeklyStats[weekNumber] = { hours: 0, sickDays: 0, vacationDays: 0 };
            }
            if (entry.sickDay) {
                weeklyStats[weekNumber].sickDays += 1;
            } else if (entry.vacationDay) {
                weeklyStats[weekNumber].vacationDays += 1;
                usedVacationDays += 1;
            } else {
                weeklyStats[weekNumber].hours += entry.hours;
            }
        }
    });
    return weeklyStats;
}
// Helper function to get week number
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export default handler;
