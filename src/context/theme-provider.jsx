import { createContext, useEffect, useState } from "react";

export const ThemeProviderContext = createContext({
  theme: "light",
  setTheme: () => null,
  toggleTheme: () => null,
});

function applyTheme(theme) {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
}

export function ThemeProvider({
  children,
  storageKey = "travista-ui-theme",
}) {
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored || "light";
  });

  // Apply theme on every change
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
