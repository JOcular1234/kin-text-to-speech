"use client";
import Footer from "./Footer";
import { useTheme } from "./ThemeContext";

export default function FooterWrapper() {
  const { darkMode } = useTheme();
  return <Footer darkMode={darkMode} />;
}
