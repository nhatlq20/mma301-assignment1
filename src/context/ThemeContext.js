import { createContext, useContext, useState } from "react";


const ThemeContext = createContext();

const lightColors = {
    background: "#fff",
    text: "#000",
    card: 'f2f2f2'
}
const darkColors = {
    background: "#000",
    text: "#fff",
    card: '1a1a1a'
}

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(false);
    const colors = isDark ? darkColors : lightColors;


    const toggleTheme = () => setIsDark(prev => !prev);
    return (
        <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
export const useTheme = () => useContext(ThemeContext);
