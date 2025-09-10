import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get theme from localStorage or default to light
    const stored = localStorage.getItem("aspora-theme") as Theme;
    return stored || "light";
  });

  const [actualTheme, setActualTheme] = useState<"light" | "dark">(() => {
    // Determine the actual theme based on system preference
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove("light", "dark");
    
    let resolvedTheme: "light" | "dark";
    
    if (theme === "system") {
      resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      resolvedTheme = theme === "dark" ? "dark" : "light";
    }
    
    // Add the resolved theme class
    root.classList.add(resolvedTheme);
    setActualTheme(resolvedTheme);
    
    // Store in localStorage
    localStorage.setItem("aspora-theme", theme);
  }, [theme]);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        const newTheme = mediaQuery.matches ? "dark" : "light";
        setActualTheme(newTheme);
        
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(newTheme);
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme,
    actualTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
