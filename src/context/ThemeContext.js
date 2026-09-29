import { createContext, useContext, useEffect, useState } from 'react';
import { getTheme, saveTheme } from '../storage/storageHelper';

const ThemeContext = createContext();
const lightColors = { background: '#fff', text: '#000', card: '#f2f2f2' };
const darkColors = { background: '#121212', text: '#fff', card: '#1e1e1e' };

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        (async () => {
            const saved = await getTheme();
            setIsDark(saved);
            setIsReady(true);
        })();
    }, []);

    const toggleTheme = () => {
        setIsDark(prev => {
            const next = !prev;
            saveTheme(next);   // persist song song, không chặn UI
            return next;
        });
    };

    const colors = isDark ? darkColors : lightColors;
    if (!isReady) return null; // tránh nháy sai theme trước khi hydrate xong

    return (
        <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);