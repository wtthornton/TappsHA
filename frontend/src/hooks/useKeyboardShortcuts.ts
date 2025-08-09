import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const shortcuts: Shortcut[] = [
    {
      key: '1',
      description: 'Go to Dashboard',
      action: () => navigate('/dashboard')
    },
    {
      key: '2',
      description: 'Go to Connections',
      action: () => navigate('/connections')
    },
    {
      key: '3',
      description: 'Go to Events',
      action: () => navigate('/events')
    },
    {
      key: '4',
      description: 'Go to Analytics',
      action: () => navigate('/analytics')
    },
    {
      key: 'r',
      ctrl: true,
      description: 'Refresh current page',
      action: () => window.location.reload()
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      action: () => {
        addToast({
          type: 'info',
          title: 'Keyboard Shortcuts',
          message: '1-4: Navigate pages, Ctrl+R: Refresh, ?: Show this help'
        });
      }
    }
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return;
      }

      const pressedKey = event.key.toLowerCase();
      const ctrl = event.ctrlKey;
      const shift = event.shiftKey;
      const alt = event.altKey;

      const shortcut = shortcuts.find(s => 
        s.key.toLowerCase() === pressedKey &&
        s.ctrl === ctrl &&
        s.shift === shift &&
        s.alt === alt
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
        
        // Show feedback for navigation shortcuts
        if (shortcut.key.match(/^[1-4]$/)) {
          addToast({
            type: 'info',
            title: 'Navigation',
            message: `Navigated to ${shortcut.description}`,
            duration: 2000
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, navigate, addToast]);

  return shortcuts;
};
