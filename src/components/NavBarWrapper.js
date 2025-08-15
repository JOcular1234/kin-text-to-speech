"use client";
import NavBar from "./NavBar";
import { useTheme } from "./ThemeContext";

export default function NavBarWrapper() {
  const { darkMode, toggleDarkMode } = useTheme();
  return <NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
}
