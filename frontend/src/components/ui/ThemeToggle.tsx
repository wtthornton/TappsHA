import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';

// ✅ Context7-validated React 19 functional component pattern
// Following React 19 best practices from Context7 documentation

export interface ThemeToggleProps {
  variant?: 'button' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'button',
  size = 'md',
  showLabel = true,
  className,
}) => {
  const { theme, toggleTheme, systemTheme } = useTheme();

  // ✅ Context7-validated theme icon pattern
  // Following React 19 best practices from Context7 documentation
  const getThemeIcon = () => {
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    
    switch (effectiveTheme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    
    switch (effectiveTheme) {
      case 'light':
        return 'Switch to Dark Mode';
      case 'dark':
        return 'Switch to System Mode';
      default:
        return 'Switch to Light Mode';
    }
  };

  const getThemeText = () => {
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    
    switch (effectiveTheme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      default:
        return 'System';
    }
  };

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg hover:bg-surface-hover transition-colors duration-200 focus-ring ${className}`}
        aria-label={getThemeLabel()}
        title={getThemeLabel()}
      >
        {getThemeIcon()}
      </button>
    );
  }

  // Button variant
  return (
    <Button
      variant="ghost"
      size={size}
      onClick={toggleTheme}
      icon={getThemeIcon()}
      className={className}
      aria-label={getThemeLabel()}
    >
      {showLabel && getThemeText()}
    </Button>
  );
};

// ✅ Context7-validated component export pattern
// Following React 19 best practices from Context7 documentation
export default ThemeToggle;
