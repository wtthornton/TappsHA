/**
 * UI Manager for Agent-OS Dashboard
 * Integrates all UI components and provides unified interface
 */

class AgentOSUIManager {
  constructor() {
    this.components = {
      notifications: null,
      modals: null,
      dataTables: new Map(),
      themeManager: null
    };
    
    this.isInitialized = false;
    this.eventListeners = new Map();
    this.globalConfig = {
      theme: 'system',
      animations: true,
      accessibility: true,
      responsive: true
    };
    
    this.init();
  }

  /**
   * Initialize the UI manager
   */
  async init() {
    try {
      console.log('🚀 Initializing Agent-OS UI Manager...');
      
      // Initialize theme manager
      this.components.themeManager = new AgentOSThemeManager();
      
      // Initialize notification system
      this.components.notifications = new AgentOSNotificationSystem();
      
      // Initialize modal system
      this.components.modals = new AgentOSModalSystem();
      
      // Setup global event listeners
      this.setupGlobalEventListeners();
      
      // Setup accessibility features
      if (this.globalConfig.accessibility) {
        this.setupAccessibility();
      }
      
      this.isInitialized = true;
      console.log('✅ Agent-OS UI Manager initialized successfully');
      
      // Show welcome notification
      this.showWelcomeNotification();
      
    } catch (error) {
      console.error('❌ Failed to initialize UI Manager:', error);
      throw error;
    }
  }

  /**
   * Setup global event listeners
   */
  setupGlobalEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });

    // Window resize handling
    window.addEventListener('resize', () => {
      this.handleWindowResize();
    });

    // Theme change events
    document.addEventListener('theme:change', (e) => {
      this.handleThemeChange(e.detail);
    });

    // Notification events
    document.addEventListener('notification:show', (e) => {
      this.handleNotificationShow(e.detail);
    });

    // Modal events
    document.addEventListener('modal:open', (e) => {
      this.handleModalOpen(e.detail);
    });
  }

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Add ARIA labels and roles
    this.addAriaLabels();
    
    // Setup focus management
    this.setupFocusManagement();
    
    // Setup screen reader announcements
    this.setupScreenReaderSupport();
  }

  /**
   * Add ARIA labels to common elements
   */
  addAriaLabels() {
    // Add role="main" to main content
    const main = document.querySelector('main');
    if (main && !main.getAttribute('role')) {
      main.setAttribute('role', 'main');
    }

    // Add role="navigation" to navigation
    const nav = document.querySelector('nav');
    if (nav && !nav.getAttribute('role')) {
      nav.setAttribute('role', 'navigation');
    }

    // Add role="banner" to header
    const header = document.querySelector('header');
    if (header && !header.getAttribute('role')) {
      header.setAttribute('role', 'banner');
    }
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Trap focus in modals
    document.addEventListener('modal:open', () => {
      this.trapFocus();
    });

    // Restore focus when modal closes
    document.addEventListener('modal:close', () => {
      this.restoreFocus();
    });
  }

  /**
   * Setup screen reader support
   */
  setupScreenReaderSupport() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(liveRegion);
    
    this.liveRegion = liveRegion;
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + K: Open search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      this.openGlobalSearch();
    }

    // Ctrl/Cmd + T: Toggle theme
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      this.toggleTheme();
    }

    // Ctrl/Cmd + M: Open modal
    if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
      e.preventDefault();
      this.openQuickActionsModal();
    }

    // Escape: Close modals/notifications
    if (e.key === 'Escape') {
      this.handleEscapeKey();
    }
  }

  /**
   * Handle window resize
   */
  handleWindowResize() {
    // Update responsive components
    this.components.dataTables.forEach(table => {
      if (table.options.responsive) {
        table.updateData();
      }
    });

    // Update modal positions
    if (this.components.modals && this.components.modals.activeModal) {
      this.components.modals.updateModalPosition();
    }
  }

  /**
   * Handle theme change
   */
  handleThemeChange(detail) {
    console.log('Theme changed to:', detail.theme);
    
    // Update global config
    this.globalConfig.theme = detail.theme;
    
    // Announce to screen reader
    if (this.liveRegion) {
      this.liveRegion.textContent = `Theme changed to ${detail.theme} mode`;
    }
  }

  /**
   * Handle notification show
   */
  handleNotificationShow(detail) {
    // Log notification for analytics
    console.log('Notification shown:', detail.notification.config);
    
    // Announce to screen reader if important
    if (detail.notification.config.type === 'error' || detail.notification.config.type === 'warning') {
      if (this.liveRegion) {
        this.liveRegion.textContent = `${detail.notification.config.title}: ${detail.notification.config.message}`;
      }
    }
  }

  /**
   * Handle modal open
   */
  handleModalOpen(detail) {
    // Log modal for analytics
    console.log('Modal opened:', detail.modal.config);
    
    // Announce to screen reader
    if (this.liveRegion) {
      this.liveRegion.textContent = `Modal opened: ${detail.modal.config.title}`;
    }
  }

  /**
   * Show welcome notification
   */
  showWelcomeNotification() {
    if (this.components.notifications) {
      this.components.notifications.success(
        'Welcome to Agent-OS',
        'UI Manager initialized successfully. Use Ctrl+K for search, Ctrl+T to toggle theme.',
        { duration: 4000 }
      );
    }
  }

  /**
   * Open global search
   */
  openGlobalSearch() {
    // Create global search modal
    const searchModal = this.components.modals.show({
      type: 'custom',
      title: 'Global Search',
      content: this.createGlobalSearchContent(),
      width: '600px'
    });
  }

  /**
   * Create global search content
   */
  createGlobalSearchContent() {
    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 16px;
    `;

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search components, features, settings...';
    searchInput.style.cssText = `
      padding: 12px 16px;
      border: 1px solid var(--color-border-medium);
      border-radius: 8px;
      font-size: 16px;
      background: var(--color-surface);
      color: var(--color-text-primary);
    `;

    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'search-results';
    resultsContainer.style.cssText = `
      max-height: 300px;
      overflow-y: auto;
    `;

    container.appendChild(searchInput);
    container.appendChild(resultsContainer);

    // Focus search input
    setTimeout(() => searchInput.focus(), 100);

    return container;
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    if (this.components.themeManager) {
      this.components.themeManager.toggleTheme();
    }
  }

  /**
   * Open quick actions modal
   */
  openQuickActionsModal() {
    const actions = [
      { label: 'Toggle Theme', action: () => this.toggleTheme() },
      { label: 'Show Notifications', action: () => this.showTestNotifications() },
      { label: 'Open Data Table', action: () => this.createSampleDataTable() },
      { label: 'System Info', action: () => this.showSystemInfo() }
    ];

    const content = this.createQuickActionsContent(actions);
    
    this.components.modals.show({
      type: 'custom',
      title: 'Quick Actions',
      content: content,
      width: '400px'
    });
  }

  /**
   * Create quick actions content
   */
  createQuickActionsContent(actions) {
    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    actions.forEach(action => {
      const button = document.createElement('button');
      button.textContent = action.label;
      button.style.cssText = `
        padding: 12px 16px;
        border: 1px solid var(--color-border-medium);
        border-radius: 6px;
        background: var(--color-surface);
        color: var(--color-text-primary);
        cursor: pointer;
        text-align: left;
        transition: all 0.2s ease;
      `;
      
      button.addEventListener('click', () => {
        action.action();
        this.components.modals.closeAll();
      });
      
      container.appendChild(button);
    });

    return container;
  }

  /**
   * Handle escape key
   */
  handleEscapeKey() {
    // Close active modal
    if (this.components.modals && this.components.modals.activeModal) {
      this.components.modals.closeModal(this.components.modals.activeModal);
    }
    
    // Clear all notifications
    if (this.components.notifications) {
      this.components.notifications.clearAll();
    }
  }

  /**
   * Trap focus in modal
   */
  trapFocus() {
    const modal = this.components.modals.activeModal;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      });

      firstElement.focus();
    }
  }

  /**
   * Restore focus
   */
  restoreFocus() {
    // Focus the element that was focused before modal opened
    if (this.previousFocusElement) {
      this.previousFocusElement.focus();
      this.previousFocusElement = null;
    }
  }

  /**
   * Show test notifications
   */
  showTestNotifications() {
    if (!this.components.notifications) return;

    this.components.notifications.success('Success', 'This is a success notification');
    setTimeout(() => {
      this.components.notifications.warning('Warning', 'This is a warning notification');
    }, 1000);
    setTimeout(() => {
      this.components.notifications.error('Error', 'This is an error notification');
    }, 2000);
    setTimeout(() => {
      this.components.notifications.info('Info', 'This is an info notification');
    }, 3000);
  }

  /**
   * Create sample data table
   */
  createSampleDataTable() {
    const container = document.createElement('div');
    container.id = 'sample-data-table';
    container.style.cssText = `
      margin: 20px;
      height: 400px;
    `;

    const columns = [
      { key: 'id', title: 'ID', sortable: true },
      { key: 'name', title: 'Name', sortable: true },
      { key: 'status', title: 'Status', sortable: true },
      { key: 'date', title: 'Date', sortable: true }
    ];

    const data = [
      { id: 1, name: 'Component A', status: 'Active', date: '2024-01-15' },
      { id: 2, name: 'Component B', status: 'Inactive', date: '2024-01-16' },
      { id: 3, name: 'Component C', status: 'Active', date: '2024-01-17' },
      { id: 4, name: 'Component D', status: 'Pending', date: '2024-01-18' }
    ];

    const table = new AgentOSDataTable(container, {
      columns,
      data,
      title: 'Sample Data Table',
      selectable: true,
      searchable: true,
      filterable: true
    });

    this.components.dataTables.set('sample', table);

    this.components.modals.show({
      type: 'custom',
      title: 'Sample Data Table',
      content: container,
      width: '800px',
      height: '500px'
    });
  }

  /**
   * Show system info
   */
  showSystemInfo() {
    const info = {
      'UI Manager': this.isInitialized ? 'Initialized' : 'Not Initialized',
      'Theme Manager': this.components.themeManager ? 'Active' : 'Inactive',
      'Notification System': this.components.notifications ? 'Active' : 'Inactive',
      'Modal System': this.components.modals ? 'Active' : 'Inactive',
      'Data Tables': this.components.dataTables.size,
      'Current Theme': this.globalConfig.theme,
      'Animations': this.globalConfig.animations ? 'Enabled' : 'Disabled',
      'Accessibility': this.globalConfig.accessibility ? 'Enabled' : 'Disabled'
    };

    const content = document.createElement('div');
    content.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    Object.entries(info).forEach(([key, value]) => {
      const row = document.createElement('div');
      row.style.cssText = `
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--color-border-light);
      `;
      
      const label = document.createElement('span');
      label.textContent = key;
      label.style.fontWeight = '600';
      
      const valueSpan = document.createElement('span');
      valueSpan.textContent = value;
      valueSpan.style.color = 'var(--color-text-secondary)';
      
      row.appendChild(label);
      row.appendChild(valueSpan);
      content.appendChild(row);
    });

    this.components.modals.show({
      type: 'info',
      title: 'System Information',
      content: content
    });
  }

  /**
   * Create data table
   */
  createDataTable(containerId, options) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with id '${containerId}' not found`);
      return null;
    }

    const table = new AgentOSDataTable(container, options);
    this.components.dataTables.set(containerId, table);
    
    return table;
  }

  /**
   * Show notification
   */
  showNotification(type, title, message, options = {}) {
    if (!this.components.notifications) {
      console.warn('Notification system not available');
      return;
    }

    return this.components.notifications[type](title, message, options);
  }

  /**
   * Show modal
   */
  showModal(options) {
    if (!this.components.modals) {
      console.warn('Modal system not available');
      return Promise.reject(new Error('Modal system not available'));
    }

    return this.components.modals.show(options);
  }

  /**
   * Get component statistics
   */
  getStats() {
    return {
      initialized: this.isInitialized,
      themeManager: this.components.themeManager ? 'active' : 'inactive',
      notifications: this.components.notifications ? this.components.notifications.getStats() : null,
      modals: this.components.modals ? this.components.modals.getStats() : null,
      dataTables: this.components.dataTables.size,
      globalConfig: this.globalConfig
    };
  }

  /**
   * Update global configuration
   */
  updateConfig(newConfig) {
    this.globalConfig = { ...this.globalConfig, ...newConfig };
    
    // Apply configuration changes
    if (newConfig.animations !== undefined) {
      this.toggleAnimations(newConfig.animations);
    }
    
    if (newConfig.accessibility !== undefined) {
      this.toggleAccessibility(newConfig.accessibility);
    }
  }

  /**
   * Toggle animations
   */
  toggleAnimations(enabled) {
    const style = document.createElement('style');
    style.id = 'agent-os-animations-toggle';
    style.textContent = enabled ? '' : `
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
    `;
    
    const existing = document.getElementById('agent-os-animations-toggle');
    if (existing) {
      existing.remove();
    }
    
    if (!enabled) {
      document.head.appendChild(style);
    }
  }

  /**
   * Toggle accessibility features
   */
  toggleAccessibility(enabled) {
    if (enabled) {
      this.setupAccessibility();
    } else {
      // Remove accessibility features
      const liveRegion = document.getElementById('agent-os-live-region');
      if (liveRegion) {
        liveRegion.remove();
      }
    }
  }

  /**
   * Destroy the UI manager
   */
  destroy() {
    // Destroy all components
    if (this.components.notifications) {
      this.components.notifications.destroy();
    }
    
    if (this.components.modals) {
      this.components.modals.destroy();
    }
    
    this.components.dataTables.forEach(table => {
      table.destroy();
    });
    
    this.components.dataTables.clear();
    
    this.isInitialized = false;
    console.log('🗑️ Agent-OS UI Manager destroyed');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AgentOSUIManager;
} else {
  window.AgentOSUIManager = AgentOSUIManager;
}
