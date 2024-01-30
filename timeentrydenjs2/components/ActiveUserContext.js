// ActiveUserContext.js

import { createContext, useState } from 'react';

export const ActiveUserContext = createContext();

export default function ActiveUserProvider({ children }) {
    const [activeUser, setActiveUser] = useState(null);

    return (
        <ActiveUserContext.Provider value={{ activeUser, setActiveUser }}>
            {children}
        </ActiveUserContext.Provider>
    )
}