/**
 * Notification System for Agent-OS Dashboard
 * Provides toast notifications, alerts, and status updates
 */

class AgentOSNotificationSystem {
  constructor() {
    this.notifications = [];
    this.container = null;
    this.isInitialized = false;
    this.maxNotifications = 5;
    this.defaultDuration = 5000;
    
    this.notificationTypes = {
      success: {
        icon: '✅',
        className: 'notification-success',
        color: 'var(--color-success-500)',
        bgColor: 'var(--color-success-50)',
        borderColor: 'var(--color-success-200)'
      },
      error: {
        icon: '❌',
        className: 'notification-error',
        color: 'var(--color-error-500)',
        bgColor: 'var(--color-error-50)',
        borderColor: 'var(--color-error-200)'
      },
      warning: {
        icon: '⚠️',
        className: 'notification-warning',
        color: 'var(--color-warning-500)',
        bgColor: 'var(--color-warning-50)',
        borderColor: 'var(--color-warning-200)'
      },
      info: {
        icon: 'ℹ️',
        className: 'notification-info',
        color: 'var(--color-info-500)',
        bgColor: 'var(--color-info-50)',
        borderColor: 'var(--color-info-200)'
      },
      system: {
        icon: '🔧',
        className: 'notification-system',
        color: 'var(--color-secondary-600)',
        bgColor: 'var(--color-secondary-50)',
        borderColor: 'var(--color-secondary-200)'
      }
    };
    
    this.init();
  }

  /**
   * Initialize the notification system
   */
  init() {
    try {
      this.createContainer();
      this.setupStyles();
      this.isInitialized = true;
      console.log('✅ Agent-OS Notification System initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notification system:', error);
    }
  }

  /**
   * Create the notification container
   */
  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'agent-os-notifications';
    this.container.className = 'notification-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
      pointer-events: none;
    `;
    
    document.body.appendChild(this.container);
  }

  /**
   * Setup notification styles
   */
  setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .notification-item {
        background: var(--color-surface-elevated);
        border: 1px solid var(--color-border-medium);
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(10px);
        pointer-events: auto;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateX(100%);
        opacity: 0;
        max-width: 400px;
        word-wrap: break-word;
      }

      .notification-item.show {
        transform: translateX(0);
        opacity: 1;
      }

      .notification-item.hide {
        transform: translateX(100%);
        opacity: 0;
      }

      .notification-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .notification-icon {
        font-size: 16px;
        margin-right: 8px;
      }

      .notification-title {
        font-weight: 600;
        font-size: 14px;
        color: var(--color-text-primary);
        flex: 1;
      }

      .notification-close {
        background: none;
        border: none;
        color: var(--color-text-tertiary);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        font-size: 12px;
        transition: color 0.2s ease;
      }

      .notification-close:hover {
        color: var(--color-text-primary);
        background: var(--color-surface-hover);
      }

      .notification-message {
        font-size: 13px;
        color: var(--color-text-secondary);
        line-height: 1.4;
        margin-bottom: 8px;
      }

      .notification-progress {
        height: 2px;
        background: var(--color-border-light);
        border-radius: 1px;
        overflow: hidden;
        margin-top: 8px;
      }

      .notification-progress-bar {
        height: 100%;
        background: var(--color-primary-500);
        transition: width 0.1s linear;
      }

      .notification-success {
        border-left: 4px solid var(--color-success-500);
      }

      .notification-error {
        border-left: 4px solid var(--color-error-500);
      }

      .notification-warning {
        border-left: 4px solid var(--color-warning-500);
      }

      .notification-info {
        border-left: 4px solid var(--color-info-500);
      }

      .notification-system {
        border-left: 4px solid var(--color-secondary-500);
      }

      @keyframes notificationSlideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes notificationSlideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      .notification-item.animate-in {
        animation: notificationSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .notification-item.animate-out {
        animation: notificationSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @media (max-width: 768px) {
        .notification-container {
          right: 10px;
          left: 10px;
          max-width: none;
        }
        
        .notification-item {
          max-width: none;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Show a notification
   */
  show(options) {
    if (!this.isInitialized) {
      console.warn('Notification system not initialized');
      return;
    }

    const {
      type = 'info',
      title = 'Notification',
      message = '',
      duration = this.defaultDuration,
      persistent = false,
      actions = [],
      data = {}
    } = options;

    const notificationType = this.notificationTypes[type] || this.notificationTypes.info;
    const notification = this.createNotification({
      type,
      title,
      message,
      duration,
      persistent,
      actions,
      data,
      ...notificationType
    });

    this.addNotification(notification);
    return notification;
  }

  /**
   * Create a notification element
   */
  createNotification(config) {
    const notification = document.createElement('div');
    notification.className = `notification-item ${config.className}`;
    notification.dataset.type = config.type;
    notification.dataset.id = Date.now() + Math.random();

    const header = document.createElement('div');
    header.className = 'notification-header';

    const icon = document.createElement('span');
    icon.className = 'notification-icon';
    icon.textContent = config.icon;

    const title = document.createElement('span');
    title.className = 'notification-title';
    title.textContent = config.title;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => this.removeNotification(notification);

    header.appendChild(icon);
    header.appendChild(title);
    header.appendChild(closeBtn);

    const message = document.createElement('div');
    message.className = 'notification-message';
    message.textContent = config.message;

    notification.appendChild(header);
    notification.appendChild(message);

    // Add progress bar if not persistent
    if (!config.persistent && config.duration > 0) {
      const progress = document.createElement('div');
      progress.className = 'notification-progress';
      
      const progressBar = document.createElement('div');
      progressBar.className = 'notification-progress-bar';
      progressBar.style.width = '100%';
      
      progress.appendChild(progressBar);
      notification.appendChild(progress);

      // Animate progress bar
      const startTime = Date.now();
      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.max(0, 100 - (elapsed / config.duration) * 100);
        progressBar.style.width = progress + '%';
        
        if (progress > 0) {
          requestAnimationFrame(animateProgress);
        }
      };
      animateProgress();
    }

    // Add actions if provided
    if (config.actions && config.actions.length > 0) {
      const actionsContainer = document.createElement('div');
      actionsContainer.className = 'notification-actions';
      actionsContainer.style.cssText = `
        display: flex;
        gap: 8px;
        margin-top: 8px;
      `;

      config.actions.forEach(action => {
        const actionBtn = document.createElement('button');
        actionBtn.className = 'notification-action';
        actionBtn.textContent = action.label;
        actionBtn.style.cssText = `
          padding: 4px 8px;
          border: 1px solid var(--color-border-medium);
          border-radius: 4px;
          background: var(--color-surface);
          color: var(--color-text-secondary);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        `;
        
        actionBtn.onclick = () => {
          if (action.callback) {
            action.callback(notification);
          }
          if (action.dismiss) {
            this.removeNotification(notification);
          }
        };
        
        actionsContainer.appendChild(actionBtn);
      });

      notification.appendChild(actionsContainer);
    }

    // Store config data
    notification.config = config;

    return notification;
  }

  /**
   * Add notification to container
   */
  addNotification(notification) {
    // Remove oldest notification if at max limit
    if (this.container.children.length >= this.maxNotifications) {
      const oldestNotification = this.container.children[0];
      this.removeNotification(oldestNotification);
    }

    this.container.appendChild(notification);
    this.notifications.push(notification);

    // Trigger animation
    requestAnimationFrame(() => {
      notification.classList.add('show', 'animate-in');
    });

    // Auto-remove if not persistent
    if (!notification.config.persistent && notification.config.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification);
      }, notification.config.duration);
    }

    // Dispatch event
    this.dispatchEvent('notification:show', { notification });
  }

  /**
   * Remove a notification
   */
  removeNotification(notification) {
    if (!notification || !notification.parentNode) {
      return;
    }

    notification.classList.add('animate-out');
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      
      const index = this.notifications.indexOf(notification);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
      
      this.dispatchEvent('notification:hide', { notification });
    }, 300);
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications.forEach(notification => {
      this.removeNotification(notification);
    });
  }

  /**
   * Show success notification
   */
  success(title, message, options = {}) {
    return this.show({
      type: 'success',
      title,
      message,
      ...options
    });
  }

  /**
   * Show error notification
   */
  error(title, message, options = {}) {
    return this.show({
      type: 'error',
      title,
      message,
      ...options
    });
  }

  /**
   * Show warning notification
   */
  warning(title, message, options = {}) {
    return this.show({
      type: 'warning',
      title,
      message,
      ...options
    });
  }

  /**
   * Show info notification
   */
  info(title, message, options = {}) {
    return this.show({
      type: 'info',
      title,
      message,
      ...options
    });
  }

  /**
   * Show system notification
   */
  system(title, message, options = {}) {
    return this.show({
      type: 'system',
      title,
      message,
      ...options
    });
  }

  /**
   * Dispatch custom event
   */
  dispatchEvent(eventName, data) {
    const event = new CustomEvent(eventName, {
      detail: data,
      bubbles: true
    });
    document.dispatchEvent(event);
  }

  /**
   * Get notification statistics
   */
  getStats() {
    return {
      total: this.notifications.length,
      byType: this.notifications.reduce((acc, notification) => {
        const type = notification.dataset.type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
      container: this.container ? this.container.children.length : 0
    };
  }

  /**
   * Destroy the notification system
   */
  destroy() {
    this.clearAll();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.isInitialized = false;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AgentOSNotificationSystem;
} else {
  window.AgentOSNotificationSystem = AgentOSNotificationSystem;
}
