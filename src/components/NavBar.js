import React from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import {Link} from "next/link";

export default function NavBar({ darkMode, toggleDarkMode }) {
  return (
    <nav className={`w-full flex items-center justify-between px-6 py-4 shadow-md ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="font-bold text-xl tracking-wide">Kinvisuals</div>
      <div className="flex items-center gap-6">
        <Link href="/" className="hover:underline">Home</Link>
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          className="ml-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
        >
          {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>
      </div>
    </nav>
  );
}
