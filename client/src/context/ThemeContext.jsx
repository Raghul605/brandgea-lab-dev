/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
    if (!isInitialized) setIsInitialized(true);
  }, [theme, isInitialized]);

  const toggleTheme = () => setTheme(t => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isInitialized }}>
      {children}
    </ThemeContext.Provider>
  );
}

// const ThemeContext = createContext();

// export function useTheme() {
//   const context = useContext(ThemeContext);
//   if (!context) {
//     throw new Error('useTheme must be used within a ThemeProvider');
//   }
//   return context;
// }

// export function ThemeProvider({ children }) {
//   const [theme, setTheme] = useState('light');
//   const [isInitialized, setIsInitialized] = useState(false);

//   useEffect(() => {
//     // Check for saved theme preference or use system preference
//     const savedTheme = localStorage.getItem('theme');
//     const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
//     if (savedTheme) {
//       setTheme(savedTheme);
//     } else if (systemPrefersDark) {
//       setTheme('dark');
//     }
//     setIsInitialized(true);
//   }, []);

//   useEffect(() => {
//     if (!isInitialized) return;
    
//     // Apply theme to document
//     const root = document.documentElement;
//     if (theme === 'dark') {
//       root.classList.add('dark');
//       root.style.colorScheme = 'dark';
//     } else {
//       root.classList.remove('dark');
//       root.style.colorScheme = 'light';
//     }
    
//     // Save theme preference
//     localStorage.setItem('theme', theme);
//   }, [theme, isInitialized]);

//   const toggleTheme = () => {
//     setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
//   };

//   const value = {
//     theme,
//     toggleTheme,
//     isInitialized,
//   };

//   return (
//     <ThemeContext.Provider value={value}>
//       {children}
//     </ThemeContext.Provider>
//   );
// }