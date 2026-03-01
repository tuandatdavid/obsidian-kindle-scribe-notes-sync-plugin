import React, { createContext, useContext } from 'react';

//todo: better types
interface SettingsContextType {
    settings: {
        openRouterKey: string,
        model: string,
    }
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode, settings: { openRouterKey: string, model: string } }> = ({ children, settings }) => {
    return (
        <SettingsContext.Provider value={{ settings }}>
            {children}
        </SettingsContext.Provider>
    );
};

// Custom hook for easy access
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};