/**
 * Modern Theme Manager for Agent-OS Dashboard
 * Phase 1: Foundation & Dark Mode Implementation
 */

class AgentOSThemeManager {
  constructor() {
    this.currentTheme = 'system';
    this.systemTheme = 'light';
    this.isInitialized = false;
    
    // Theme options
    this.themes = {
      light: 'light',
      dark: 'dark',
      system: 'system'
    };
    
    // Initialize theme manager
    this.init();
  }

  /**
   * Initialize the theme manager
   */
  init() {
    try {
      // Load saved theme from localStorage
      this.loadSavedTheme();
      
      // Detect system theme preference
      this.detectSystemTheme();
      
      // Apply initial theme
      this.applyTheme();
      
      // Set up system theme change listener
      this.setupSystemThemeListener();
      
      this.isInitialized = true;
      console.log('✅ Agent-OS Theme Manager initialized');
      console.log('Current theme:', this.currentTheme);
      console.log('Effective theme:', this.getEffectiveTheme());
    } catch (error) {
      console.error('❌ Failed to initialize theme manager:', error);
    }
  }

  /**
   * Load saved theme from localStorage
   */
  loadSavedTheme() {
    try {
      const savedTheme = localStorage.getItem('agent-os-theme');
      if (savedTheme && this.themes[savedTheme]) {
        this.currentTheme = savedTheme;
      }
    } catch (error) {
      console.warn('Could not load saved theme:', error);
    }
  }

  /**
   * Detect system theme preference
   */
  detectSystemTheme() {
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemTheme = mediaQuery.matches ? 'dark' : 'light';
    } catch (error) {
      console.warn('Could not detect system theme:', error);
      this.systemTheme = 'light';
    }
  }

  /**
   * Set up listener for system theme changes
   */
  setupSystemThemeListener() {
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e) => {
        this.systemTheme = e.matches ? 'dark' : 'light';
        if (this.currentTheme === 'system') {
          this.applyTheme();
        }
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
      } else {
        // Legacy browsers
        mediaQuery.addListener(handleSystemThemeChange);
      }
    } catch (error) {
      console.warn('Could not set up system theme listener:', error);
    }
  }

  /**
   * Get the effective theme (resolves 'system' to actual theme)
   */
  getEffectiveTheme() {
    return this.currentTheme === 'system' ? this.systemTheme : this.currentTheme;
  }

  /**
   * Apply the current theme to the document
   */
  applyTheme() {
    try {
      const effectiveTheme = this.getEffectiveTheme();
      const root = document.documentElement;
      
      // Remove existing theme attributes
      root.removeAttribute('data-theme');
      
      // Apply the effective theme
      if (effectiveTheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        console.log('🌙 Applied dark theme');
      } else {
        console.log('☀️ Applied light theme');
      }
      
      // Save theme preference
      this.saveTheme();
      
      // Dispatch theme change event
      this.dispatchThemeChangeEvent();
      
      console.log(`🎨 Applied theme: ${effectiveTheme} (${this.currentTheme})`);
    } catch (error) {
      console.error('Failed to apply theme:', error);
    }
  }

  /**
   * Set a new theme
   */
  setTheme(theme) {
    if (!this.themes[theme]) {
      console.warn(`Invalid theme: ${theme}`);
      return;
    }
    
    this.currentTheme = theme;
    this.applyTheme();
  }

  /**
   * Toggle between light, dark, and system themes
   */
  toggleTheme() {
    const themeOrder = ['light', 'dark', 'system'];
    const currentIndex = themeOrder.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    const nextTheme = themeOrder[nextIndex];
    
    this.setTheme(nextTheme);
  }

  /**
   * Save theme preference to localStorage
   */
  saveTheme() {
    try {
      localStorage.setItem('agent-os-theme', this.currentTheme);
    } catch (error) {
      console.warn('Could not save theme preference:', error);
    }
  }

  /**
   * Dispatch theme change event
   */
  dispatchThemeChangeEvent() {
    try {
      const event = new CustomEvent('agent-os-theme-change', {
        detail: {
          theme: this.currentTheme,
          effectiveTheme: this.getEffectiveTheme(),
          systemTheme: this.systemTheme
        }
      });
      document.dispatchEvent(event);
    } catch (error) {
      console.warn('Could not dispatch theme change event:', error);
    }
  }

  /**
   * Get theme information
   */
  getThemeInfo() {
    return {
      currentTheme: this.currentTheme,
      effectiveTheme: this.getEffectiveTheme(),
      systemTheme: this.systemTheme,
      isDark: this.getEffectiveTheme() === 'dark',
      isLight: this.getEffectiveTheme() === 'light'
    };
  }

  /**
   * Get theme icon for UI
   */
  getThemeIcon() {
    const effectiveTheme = this.getEffectiveTheme();
    
    switch (effectiveTheme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      default:
        return '💻';
    }
  }

  /**
   * Get theme label for UI
   */
  getThemeLabel() {
    const effectiveTheme = this.getEffectiveTheme();
    
    switch (effectiveTheme) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      default:
        return 'System Mode';
    }
  }

  /**
   * Get theme toggle label
   */
  getToggleLabel() {
    const effectiveTheme = this.getEffectiveTheme();
    
    switch (effectiveTheme) {
      case 'light':
        return 'Switch to Dark Mode';
      case 'dark':
        return 'Switch to System Mode';
      default:
        return 'Switch to Light Mode';
    }
  }

  /**
   * Create theme toggle button HTML
   */
  createThemeToggleButton() {
    const themeInfo = this.getThemeInfo();
    const icon = this.getThemeIcon();
    const label = this.getToggleLabel();
    
    return `
      <button 
        class="agent-os-theme-toggle agent-os-button agent-os-button-secondary"
        onclick="window.agentOSThemeManager.toggleTheme()"
        aria-label="${label}"
        title="${label}"
      >
        <span class="theme-icon">${icon}</span>
        <span class="theme-label">${themeInfo.effectiveTheme}</span>
      </button>
    `;
  }

  /**
   * Initialize theme toggle functionality
   */
  initThemeToggle() {
    // Add theme toggle button to the page
    const toggleContainer = document.getElementById('theme-toggle-container');
    if (toggleContainer) {
      toggleContainer.innerHTML = this.createThemeToggleButton();
    }
    
    // Listen for theme changes to update UI
    document.addEventListener('agent-os-theme-change', () => {
      this.updateThemeToggleUI();
    });
  }

  /**
   * Update theme toggle UI
   */
  updateThemeToggleUI() {
    const toggleButton = document.querySelector('.agent-os-theme-toggle');
    if (toggleButton) {
      const themeInfo = this.getThemeInfo();
      const icon = this.getThemeIcon();
      const label = this.getToggleLabel();
      
      const iconSpan = toggleButton.querySelector('.theme-icon');
      const labelSpan = toggleButton.querySelector('.theme-label');
      
      if (iconSpan) iconSpan.textContent = icon;
      if (labelSpan) labelSpan.textContent = themeInfo.effectiveTheme;
      
      toggleButton.setAttribute('aria-label', label);
      toggleButton.setAttribute('title', label);
    }
  }

  /**
   * Add theme toggle to any element
   */
  addThemeToggleToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = this.createThemeToggleButton();
    }
  }

  /**
   * Get CSS variables for current theme
   */
  getThemeCSSVariables() {
    const effectiveTheme = this.getEffectiveTheme();
    const isDark = effectiveTheme === 'dark';
    
    return {
      '--color-background': isDark ? '#0f172a' : '#ffffff',
      '--color-surface': isDark ? '#1e293b' : '#f8fafc',
      '--color-text-primary': isDark ? '#f1f5f9' : '#1e293b',
      '--color-text-secondary': isDark ? '#94a3b8' : '#64748b',
      '--color-border-light': isDark ? '#334155' : '#e2e8f0'
    };
  }

  /**
   * Apply theme CSS variables to an element
   */
  applyThemeToElement(element, variables) {
    if (!element) return;
    
    Object.entries(variables).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
  }
}

// Initialize global theme manager
window.agentOSThemeManager = new AgentOSThemeManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.agentOSThemeManager.initThemeToggle();
  });
} else {
  window.agentOSThemeManager.initThemeToggle();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AgentOSThemeManager;
}
