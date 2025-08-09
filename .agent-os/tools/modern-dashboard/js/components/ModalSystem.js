/**
 * Modal System for Agent-OS Dashboard
 * Provides modal dialogs, confirmations, and form overlays
 */

class AgentOSModalSystem {
  constructor() {
    this.modals = [];
    this.activeModal = null;
    this.isInitialized = false;
    this.backdrop = null;
    this.modalContainer = null;
    
    this.modalTypes = {
      alert: {
        className: 'modal-alert',
        icon: 'ℹ️',
        showCancel: false
      },
      confirm: {
        className: 'modal-confirm',
        icon: '❓',
        showCancel: true
      },
      warning: {
        className: 'modal-warning',
        icon: '⚠️',
        showCancel: true
      },
      error: {
        className: 'modal-error',
        icon: '❌',
        showCancel: false
      },
      success: {
        className: 'modal-success',
        icon: '✅',
        showCancel: false
      },
      form: {
        className: 'modal-form',
        icon: '📝',
        showCancel: true
      },
      custom: {
        className: 'modal-custom',
        icon: '🔧',
        showCancel: true
      }
    };
    
    this.init();
  }

  /**
   * Initialize the modal system
   */
  init() {
    try {
      this.createBackdrop();
      this.createModalContainer();
      this.setupStyles();
      this.setupEventListeners();
      this.isInitialized = true;
      console.log('✅ Agent-OS Modal System initialized');
    } catch (error) {
      console.error('❌ Failed to initialize modal system:', error);
    }
  }

  /**
   * Create backdrop element
   */
  createBackdrop() {
    this.backdrop = document.createElement('div');
    this.backdrop.id = 'agent-os-modal-backdrop';
    this.backdrop.className = 'modal-backdrop';
    this.backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 9999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    
    document.body.appendChild(this.backdrop);
  }

  /**
   * Create modal container
   */
  createModalContainer() {
    this.modalContainer = document.createElement('div');
    this.modalContainer.id = 'agent-os-modal-container';
    this.modalContainer.className = 'modal-container';
    this.modalContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      pointer-events: none;
    `;
    
    document.body.appendChild(this.modalContainer);
  }

  /**
   * Setup modal styles
   */
  setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .modal {
        background: var(--color-surface-elevated);
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow: hidden;
        pointer-events: auto;
        transform: scale(0.9) translateY(20px);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid var(--color-border-medium);
      }

      .modal.show {
        transform: scale(1) translateY(0);
        opacity: 1;
      }

      .modal-header {
        padding: 20px 24px 16px;
        border-bottom: 1px solid var(--color-border-light);
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .modal-icon {
        font-size: 20px;
        flex-shrink: 0;
      }

      .modal-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0;
        flex: 1;
      }

      .modal-close {
        background: none;
        border: none;
        color: var(--color-text-tertiary);
        cursor: pointer;
        padding: 8px;
        border-radius: 6px;
        font-size: 16px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .modal-close:hover {
        color: var(--color-text-primary);
        background: var(--color-surface-hover);
      }

      .modal-body {
        padding: 20px 24px;
        color: var(--color-text-secondary);
        line-height: 1.6;
        max-height: 60vh;
        overflow-y: auto;
      }

      .modal-footer {
        padding: 16px 24px 20px;
        border-top: 1px solid var(--color-border-light);
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        align-items: center;
      }

      .modal-button {
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid transparent;
        min-width: 80px;
      }

      .modal-button-primary {
        background: var(--color-primary-500);
        color: white;
        border-color: var(--color-primary-500);
      }

      .modal-button-primary:hover {
        background: var(--color-primary-600);
        border-color: var(--color-primary-600);
      }

      .modal-button-secondary {
        background: var(--color-surface);
        color: var(--color-text-secondary);
        border-color: var(--color-border-medium);
      }

      .modal-button-secondary:hover {
        background: var(--color-surface-hover);
        color: var(--color-text-primary);
      }

      .modal-button-danger {
        background: var(--color-error-500);
        color: white;
        border-color: var(--color-error-500);
      }

      .modal-button-danger:hover {
        background: var(--color-error-600);
        border-color: var(--color-error-600);
      }

      .modal-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .modal-form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .modal-form-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-primary);
      }

      .modal-form-input {
        padding: 10px 12px;
        border: 1px solid var(--color-border-medium);
        border-radius: 6px;
        font-size: 14px;
        background: var(--color-surface);
        color: var(--color-text-primary);
        transition: border-color 0.2s ease;
      }

      .modal-form-input:focus {
        outline: none;
        border-color: var(--color-primary-500);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .modal-form-textarea {
        min-height: 100px;
        resize: vertical;
      }

      .modal-form-select {
        cursor: pointer;
      }

      .modal-alert {
        border-left: 4px solid var(--color-info-500);
      }

      .modal-confirm {
        border-left: 4px solid var(--color-warning-500);
      }

      .modal-warning {
        border-left: 4px solid var(--color-warning-500);
      }

      .modal-error {
        border-left: 4px solid var(--color-error-500);
      }

      .modal-success {
        border-left: 4px solid var(--color-success-500);
      }

      .modal-form {
        border-left: 4px solid var(--color-primary-500);
      }

      .modal-custom {
        border-left: 4px solid var(--color-secondary-500);
      }

      @keyframes modalSlideIn {
        from {
          transform: scale(0.9) translateY(20px);
          opacity: 0;
        }
        to {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
      }

      @keyframes modalSlideOut {
        from {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
        to {
          transform: scale(0.9) translateY(20px);
          opacity: 0;
        }
      }

      .modal.animate-in {
        animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .modal.animate-out {
        animation: modalSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @media (max-width: 768px) {
        .modal {
          width: 95%;
          margin: 20px;
        }
        
        .modal-header,
        .modal-body,
        .modal-footer {
          padding: 16px 20px;
        }
        
        .modal-footer {
          flex-direction: column;
          gap: 8px;
        }
        
        .modal-button {
          width: 100%;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Backdrop click to close
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop && this.activeModal) {
        this.closeModal(this.activeModal);
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.closeModal(this.activeModal);
      }
    });
  }

  /**
   * Show a modal
   */
  show(options) {
    if (!this.isInitialized) {
      console.warn('Modal system not initialized');
      return Promise.reject(new Error('Modal system not initialized'));
    }

    const {
      type = 'custom',
      title = 'Modal',
      message = '',
      content = null,
      buttons = [],
      form = null,
      onConfirm = null,
      onCancel = null,
      onClose = null,
      closable = true,
      width = null,
      height = null
    } = options;

    const modalType = this.modalTypes[type] || this.modalTypes.custom;
    const modal = this.createModal({
      type,
      title,
      message,
      content,
      buttons,
      form,
      onConfirm,
      onCancel,
      onClose,
      closable,
      width,
      height,
      ...modalType
    });

    return this.openModal(modal);
  }

  /**
   * Create a modal element
   */
  createModal(config) {
    const modal = document.createElement('div');
    modal.className = `modal ${config.className}`;
    modal.dataset.type = config.type;
    modal.dataset.id = Date.now() + Math.random();

    // Set custom dimensions
    if (config.width) {
      modal.style.maxWidth = config.width;
    }
    if (config.height) {
      modal.style.maxHeight = config.height;
    }

    // Header
    const header = document.createElement('div');
    header.className = 'modal-header';

    const icon = document.createElement('span');
    icon.className = 'modal-icon';
    icon.textContent = config.icon;

    const title = document.createElement('h3');
    title.className = 'modal-title';
    title.textContent = config.title;

    header.appendChild(icon);
    header.appendChild(title);

    if (config.closable) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'modal-close';
      closeBtn.innerHTML = '×';
      closeBtn.onclick = () => this.closeModal(modal);
      header.appendChild(closeBtn);
    }

    // Body
    const body = document.createElement('div');
    body.className = 'modal-body';

    if (config.content) {
      body.appendChild(config.content);
    } else if (config.form) {
      body.appendChild(this.createForm(config.form));
    } else if (config.message) {
      body.textContent = config.message;
    }

    // Footer
    const footer = document.createElement('div');
    footer.className = 'modal-footer';

    // Add buttons
    if (config.buttons && config.buttons.length > 0) {
      config.buttons.forEach(button => {
        const btn = this.createButton(button, modal);
        footer.appendChild(btn);
      });
    } else {
      // Default buttons based on type
      if (config.showCancel) {
        const cancelBtn = this.createButton({
          text: 'Cancel',
          type: 'secondary',
          action: 'cancel'
        }, modal);
        footer.appendChild(cancelBtn);
      }

      const confirmBtn = this.createButton({
        text: 'OK',
        type: 'primary',
        action: 'confirm'
      }, modal);
      footer.appendChild(confirmBtn);
    }

    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);

    // Store config
    modal.config = config;

    return modal;
  }

  /**
   * Create a button element
   */
  createButton(buttonConfig, modal) {
    const button = document.createElement('button');
    button.className = `modal-button modal-button-${buttonConfig.type || 'secondary'}`;
    button.textContent = buttonConfig.text;
    
    button.onclick = () => {
      if (buttonConfig.action === 'confirm' && modal.config.onConfirm) {
        modal.config.onConfirm(modal);
      } else if (buttonConfig.action === 'cancel' && modal.config.onCancel) {
        modal.config.onCancel(modal);
      } else if (buttonConfig.callback) {
        buttonConfig.callback(modal);
      }
      
      if (buttonConfig.close !== false) {
        this.closeModal(modal);
      }
    };

    return button;
  }

  /**
   * Create form element
   */
  createForm(formConfig) {
    const form = document.createElement('form');
    form.className = 'modal-form';

    formConfig.fields.forEach(field => {
      const group = document.createElement('div');
      group.className = 'modal-form-group';

      const label = document.createElement('label');
      label.className = 'modal-form-label';
      label.textContent = field.label;
      if (field.required) {
        label.textContent += ' *';
      }

      let input;
      if (field.type === 'textarea') {
        input = document.createElement('textarea');
        input.className = 'modal-form-input modal-form-textarea';
      } else if (field.type === 'select') {
        input = document.createElement('select');
        input.className = 'modal-form-input modal-form-select';
        
        if (field.placeholder) {
          const option = document.createElement('option');
          option.value = '';
          option.textContent = field.placeholder;
          input.appendChild(option);
        }
        
        field.options.forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option.value;
          optionElement.textContent = option.label;
          input.appendChild(optionElement);
        });
      } else {
        input = document.createElement('input');
        input.className = 'modal-form-input';
        input.type = field.type || 'text';
      }

      input.name = field.name;
      input.placeholder = field.placeholder;
      input.required = field.required;
      input.value = field.value || '';

      group.appendChild(label);
      group.appendChild(input);
      form.appendChild(group);
    });

    return form;
  }

  /**
   * Open a modal
   */
  openModal(modal) {
    return new Promise((resolve, reject) => {
      // Close any existing modal
      if (this.activeModal) {
        this.closeModal(this.activeModal);
      }

      this.modalContainer.appendChild(modal);
      this.modals.push(modal);
      this.activeModal = modal;

      // Show backdrop
      this.backdrop.style.visibility = 'visible';
      this.backdrop.style.opacity = '1';

      // Show modal
      requestAnimationFrame(() => {
        modal.classList.add('show', 'animate-in');
      });

      // Store resolve/reject
      modal.resolve = resolve;
      modal.reject = reject;

      // Dispatch event
      this.dispatchEvent('modal:open', { modal });
    });
  }

  /**
   * Close a modal
   */
  closeModal(modal) {
    if (!modal || !modal.parentNode) {
      return;
    }

    modal.classList.add('animate-out');
    
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
      
      const index = this.modals.indexOf(modal);
      if (index > -1) {
        this.modals.splice(index, 1);
      }
      
      if (this.activeModal === modal) {
        this.activeModal = null;
      }

      // Hide backdrop if no more modals
      if (this.modals.length === 0) {
        this.backdrop.style.visibility = 'hidden';
        this.backdrop.style.opacity = '0';
      }

      // Resolve/reject promise
      if (modal.resolve) {
        modal.resolve({ action: 'close' });
      }

      this.dispatchEvent('modal:close', { modal });
    }, 300);
  }

  /**
   * Show alert modal
   */
  alert(title, message, options = {}) {
    return this.show({
      type: 'alert',
      title,
      message,
      ...options
    });
  }

  /**
   * Show confirm modal
   */
  confirm(title, message, options = {}) {
    return this.show({
      type: 'confirm',
      title,
      message,
      ...options
    });
  }

  /**
   * Show warning modal
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
   * Show error modal
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
   * Show success modal
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
   * Show form modal
   */
  form(title, formConfig, options = {}) {
    return this.show({
      type: 'form',
      title,
      form: formConfig,
      ...options
    });
  }

  /**
   * Close all modals
   */
  closeAll() {
    this.modals.forEach(modal => {
      this.closeModal(modal);
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
   * Get modal statistics
   */
  getStats() {
    return {
      total: this.modals.length,
      active: this.activeModal ? 1 : 0,
      byType: this.modals.reduce((acc, modal) => {
        const type = modal.dataset.type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {})
    };
  }

  /**
   * Destroy the modal system
   */
  destroy() {
    this.closeAll();
    if (this.backdrop && this.backdrop.parentNode) {
      this.backdrop.parentNode.removeChild(this.backdrop);
    }
    if (this.modalContainer && this.modalContainer.parentNode) {
      this.modalContainer.parentNode.removeChild(this.modalContainer);
    }
    this.isInitialized = false;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AgentOSModalSystem;
} else {
  window.AgentOSModalSystem = AgentOSModalSystem;
}
