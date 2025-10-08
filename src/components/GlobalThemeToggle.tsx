'use client';

import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function GlobalThemeToggle() {
  const pathname = usePathname();
  
  // Don't show on dashboard (it has its own toggle)
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <ThemeToggle />
    </div>
  );
}
