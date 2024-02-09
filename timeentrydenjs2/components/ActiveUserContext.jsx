import logToServer from '@/utils/lib';
import { createContext, useState, useEffect } from 'react';

export const ActiveUserContext = createContext();

export default function ActiveUserProvider({ children }) {
    const [activeUser, setActiveUser] = useState(null);

    useEffect(() => {
        const fetchActiveUser = async () => {
            logToServer('Fetching active user data');
            try {
                const response = await fetch('/api/session/getActiveUser', {
                    method: 'GET',
                });
                if (response.status === 404) {
                    logToServer('API route not found');
                    return;
                }
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                logToServer('Fetched active user data: ' + JSON.stringify(data));

                setActiveUser(data);
            } catch (error) {
                logToServer('Error fetching active user data: ' + error);
                console.error(error);
            }
        };

        fetchActiveUser();
    }, []);

    return (
        <ActiveUserContext.Provider value={{ activeUser, setActiveUser }}>
            {children}
        </ActiveUserContext.Provider>
    )
}
