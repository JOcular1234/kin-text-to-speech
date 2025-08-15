import React from "react";

export default function Footer({ darkMode }) {
  return (
    <footer className={`w-full text-center py-4 mt-10 border-t ${darkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}>
      <div>
        &copy; {new Date().getFullYear()} Kinvisuals. All rights reserved.
      </div>
    </footer>
  );
}
