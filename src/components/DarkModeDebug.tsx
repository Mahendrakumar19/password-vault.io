'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function DarkModeDebug() {
  const { theme, toggleTheme } = useTheme();
  const [htmlClasses, setHtmlClasses] = useState('');
  const [storageTheme, setStorageTheme] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setHtmlClasses(document.documentElement.className);
      setStorageTheme(localStorage.getItem('theme') || 'none');
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-lg z-50 max-w-md">
      <h3 className="font-bold mb-2 text-gray-900 dark:text-white">🐛 Dark Mode Debug</h3>
      <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
        <p><strong>Context Theme:</strong> {theme}</p>
        <p><strong>HTML Classes:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-1">{htmlClasses || '(none)'}</code></p>
        <p><strong>localStorage:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-1">{storageTheme}</code></p>
      </div>
      <button
        onClick={toggleTheme}
        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
      >
        Toggle Theme (Current: {theme})
      </button>
      <div className="mt-2 p-2 bg-blue-500 dark:bg-blue-700 text-white rounded text-xs">
        This box should change color on toggle
      </div>
    </div>
  );
}
