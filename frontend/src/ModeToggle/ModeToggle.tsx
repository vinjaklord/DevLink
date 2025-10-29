import { Button } from '@/Components/ui';
import * as React from 'react';
import { Moon, Sun } from 'lucide-react';

export function ModeToggle() {
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = React.useState(
    () => localStorage.getItem('theme') || 'dark'
  );

  const toggleMode = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Apply theme to document and persist in localStorage
  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <Button variant="ghost" size="icon" onClick={toggleMode}>
      {theme === 'light' ? (
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      ) : (
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      )}
    </Button>
  );
}
