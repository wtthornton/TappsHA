# Agent-OS UI Components

A comprehensive collection of modern, accessible, and interactive UI components for the Agent-OS dashboard system.

## 🚀 Overview

The Agent-OS UI Components provide a complete set of reusable UI elements designed for modern web applications. All components are built with accessibility in mind, support dark/light themes, and include comprehensive TypeScript definitions.

## 📦 Components

### 1. Theme Manager (`theme-manager.js`)

**Features:**
- Dynamic theme switching (light/dark/system)
- System preference detection
- Persistent theme storage
- Smooth transitions
- CSS custom properties support

**Usage:**
```javascript
// Initialize theme manager
const themeManager = new AgentOSThemeManager();

// Set theme
themeManager.setTheme('dark');

// Toggle theme
themeManager.toggleTheme();

// Get theme info
const info = themeManager.getThemeInfo();
```

### 2. Notification System (`NotificationSystem.js`)

**Features:**
- 5 notification types (success, error, warning, info, system)
- Auto-dismiss with progress bar
- Interactive actions
- Persistent notifications
- Maximum 5 notifications at once
- Smooth animations
- Mobile responsive

**Usage:**
```javascript
// Initialize notification system
const notifications = new AgentOSNotificationSystem();

// Show notifications
notifications.success('Success', 'Operation completed');
notifications.error('Error', 'Something went wrong');
notifications.warning('Warning', 'Please review input');
notifications.info('Info', 'Here is some information');
notifications.system('System', 'System update available');

// Show with actions
notifications.show({
  type: 'warning',
  title: 'Confirm Action',
  message: 'Are you sure?',
  actions: [
    { label: 'Yes', callback: () => console.log('Confirmed') },
    { label: 'No', callback: () => console.log('Cancelled') }
  ]
});
```

### 3. Modal System (`ModalSystem.js`)

**Features:**
- 7 modal types (alert, confirm, warning, error, success, form, custom)
- Form support with validation
- Keyboard navigation (Escape to close)
- Backdrop click to close
- Focus trapping
- Responsive design
- Custom content support

**Usage:**
```javascript
// Initialize modal system
const modals = new AgentOSModalSystem();

// Show basic modals
modals.alert('Information', 'This is an alert');
modals.confirm('Confirm', 'Are you sure?');
modals.warning('Warning', 'Proceed with caution');
modals.error('Error', 'An error occurred');
modals.success('Success', 'Operation completed');

// Show form modal
modals.form('User Details', {
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'role', label: 'Role', type: 'select', options: [
      { value: 'admin', label: 'Administrator' },
      { value: 'user', label: 'User' }
    ]},
    { name: 'notes', label: 'Notes', type: 'textarea' }
  ]
});

// Show custom modal
modals.show({
  type: 'custom',
  title: 'Custom Modal',
  content: document.createElement('div'),
  width: '500px'
});
```

### 4. Data Table (`DataTable.js`)

**Features:**
- Sortable columns
- Search functionality
- Column filtering
- Row selection
- Pagination
- Responsive design
- Loading states
- Custom cell rendering

**Usage:**
```javascript
// Create data table
const table = new AgentOSDataTable('table-container', {
  columns: [
    { key: 'id', title: 'ID', sortable: true },
    { key: 'name', title: 'Name', sortable: true },
    { key: 'status', title: 'Status', sortable: true, render: (value) => {
      const color = value === 'Active' ? 'green' : 'red';
      return `<span style="color: ${color};">${value}</span>`;
    }}
  ],
  data: [
    { id: 1, name: 'Item 1', status: 'Active' },
    { id: 2, name: 'Item 2', status: 'Inactive' }
  ],
  title: 'Sample Table',
  selectable: true,
  searchable: true,
  filterable: true,
  pageSize: 10
});

// Update data
table.setData(newData);

// Get selected rows
const selected = table.getSelectedRows();

// Set loading state
table.setLoading(true);
```

### 5. UI Manager (`UIManager.js`)

**Features:**
- Centralized management of all components
- Global configuration
- Keyboard shortcuts
- Accessibility features
- Event handling
- Component lifecycle management

**Usage:**
```javascript
// Initialize UI manager
const uiManager = new AgentOSUIManager();
await uiManager.init();

// Show notifications
uiManager.showNotification('success', 'Success', 'Operation completed');

// Show modals
uiManager.showModal({
  type: 'confirm',
  title: 'Confirm Action',
  message: 'Are you sure?'
});

// Create data table
const table = uiManager.createDataTable('container-id', options);

// Get system stats
const stats = uiManager.getStats();

// Update global config
uiManager.updateConfig({
  animations: false,
  accessibility: true
});
```

## 🎨 Design System

### Color Palette

The components use a comprehensive color system with CSS custom properties:

```css
/* Primary Colors */
--color-primary-50: #eff6ff;
--color-primary-500: #3b82f6;
--color-primary-900: #1e3a8a;

/* Semantic Colors */
--color-success-500: #10b981;
--color-warning-500: #f59e0b;
--color-error-500: #ef4444;
--color-info-500: #3b82f6;

/* Neutral Colors */
--color-gray-50: #f9fafb;
--color-gray-900: #111827;
```

### Typography

```css
/* Font Families */
--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
```

### Spacing

```css
/* Spacing Scale */
--spacing-0: 0;
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-4: 1rem;      /* 16px */
--spacing-8: 2rem;      /* 32px */
--spacing-16: 4rem;     /* 64px */
```

## ♿ Accessibility

All components are built with accessibility in mind:

### ARIA Support
- Proper ARIA labels and roles
- Screen reader announcements
- Focus management
- Keyboard navigation

### Keyboard Shortcuts
- `Ctrl+K`: Open global search
- `Ctrl+T`: Toggle theme
- `Ctrl+M`: Quick actions
- `Escape`: Close modals/notifications

### Focus Management
- Focus trapping in modals
- Focus restoration
- Visible focus indicators
- Logical tab order

## 📱 Responsive Design

All components are mobile-first and responsive:

### Breakpoints
```css
/* Mobile First */
@media (max-width: 768px) {
  /* Mobile styles */
}

@media (min-width: 769px) {
  /* Desktop styles */
}
```

### Mobile Optimizations
- Touch-friendly button sizes
- Simplified layouts
- Optimized spacing
- Swipe gestures support

## 🔧 Configuration

### Global Configuration

```javascript
const config = {
  theme: 'system',           // 'light', 'dark', 'system'
  animations: true,          // Enable/disable animations
  accessibility: true,       // Enable accessibility features
  responsive: true,          // Enable responsive behavior
  maxNotifications: 5,       // Maximum notifications
  defaultDuration: 5000      // Default notification duration
};
```

### Component-Specific Configuration

Each component accepts its own configuration options:

```javascript
// Notification configuration
const notificationConfig = {
  type: 'success',
  title: 'Success',
  message: 'Operation completed',
  duration: 5000,
  persistent: false,
  actions: []
};

// Modal configuration
const modalConfig = {
  type: 'confirm',
  title: 'Confirm Action',
  message: 'Are you sure?',
  width: '500px',
  closable: true
};

// Data table configuration
const tableConfig = {
  columns: [],
  data: [],
  pageSize: 10,
  sortable: true,
  filterable: true,
  selectable: false,
  searchable: true
};
```

## 🚀 Quick Start

### 1. Include Components

```html
<!-- Load components -->
<script src="modern-dashboard/theme-manager.js"></script>
<script src="modern-dashboard/js/components/NotificationSystem.js"></script>
<script src="modern-dashboard/js/components/ModalSystem.js"></script>
<script src="modern-dashboard/js/components/DataTable.js"></script>
<script src="modern-dashboard/js/components/UIManager.js"></script>
```

### 2. Initialize UI Manager

```javascript
// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const uiManager = new AgentOSUIManager();
  await uiManager.init();
  
  // Your application code here
});
```

### 3. Use Components

```javascript
// Show a notification
uiManager.showNotification('success', 'Welcome!', 'UI components loaded successfully');

// Show a modal
uiManager.showModal({
  type: 'info',
  title: 'Information',
  message: 'This is a demo modal'
});

// Create a data table
const table = uiManager.createDataTable('my-table', {
  columns: [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Name' }
  ],
  data: [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ]
});
```

## 📚 API Reference

### Theme Manager

| Method | Description |
|--------|-------------|
| `setTheme(theme)` | Set theme (light/dark/system) |
| `toggleTheme()` | Toggle between light and dark |
| `getThemeInfo()` | Get current theme information |
| `getEffectiveTheme()` | Get the effective theme |

### Notification System

| Method | Description |
|--------|-------------|
| `show(options)` | Show a notification |
| `success(title, message)` | Show success notification |
| `error(title, message)` | Show error notification |
| `warning(title, message)` | Show warning notification |
| `info(title, message)` | Show info notification |
| `system(title, message)` | Show system notification |
| `clearAll()` | Clear all notifications |

### Modal System

| Method | Description |
|--------|-------------|
| `show(options)` | Show a modal |
| `alert(title, message)` | Show alert modal |
| `confirm(title, message)` | Show confirm modal |
| `warning(title, message)` | Show warning modal |
| `error(title, message)` | Show error modal |
| `success(title, message)` | Show success modal |
| `form(title, config)` | Show form modal |
| `closeAll()` | Close all modals |

### Data Table

| Method | Description |
|--------|-------------|
| `setData(data)` | Update table data |
| `setLoading(loading)` | Set loading state |
| `getSelectedRows()` | Get selected rows |
| `clearSelection()` | Clear selection |
| `destroy()` | Destroy table |

### UI Manager

| Method | Description |
|--------|-------------|
| `init()` | Initialize all components |
| `showNotification(type, title, message)` | Show notification |
| `showModal(options)` | Show modal |
| `createDataTable(container, options)` | Create data table |
| `getStats()` | Get system statistics |
| `updateConfig(config)` | Update global configuration |
| `destroy()` | Destroy all components |

## 🧪 Testing

### Demo Page

Open `ui-demo.html` in your browser to see all components in action:

```bash
# Start a local server
python -m http.server 8000

# Open demo page
open http://localhost:8000/tools/modern-dashboard/ui-demo.html
```

### Interactive Examples

The demo page includes:
- All notification types
- All modal types
- Data table with sample data
- Theme switching
- Keyboard shortcuts
- System statistics

## 🔄 Events

### Custom Events

Components dispatch custom events for integration:

```javascript
// Theme change event
document.addEventListener('theme:change', (e) => {
  console.log('Theme changed to:', e.detail.theme);
});

// Notification events
document.addEventListener('notification:show', (e) => {
  console.log('Notification shown:', e.detail.notification);
});

// Modal events
document.addEventListener('modal:open', (e) => {
  console.log('Modal opened:', e.detail.modal);
});
```

## 🛠️ Development

### Building Components

Components are written in vanilla JavaScript for maximum compatibility:

```javascript
// Component structure
class ComponentName {
  constructor(options) {
    this.options = { ...defaultOptions, ...options };
    this.init();
  }
  
  init() {
    // Initialize component
  }
  
  // Component methods
}
```

### Adding New Components

1. Create component file in `js/components/`
2. Follow naming convention: `ComponentName.js`
3. Include proper documentation
4. Add to UI Manager if needed
5. Update demo page
6. Test thoroughly

## 📄 License

This project is part of the Agent-OS framework and follows the same licensing terms.

## 🤝 Contributing

When contributing to UI components:

1. Follow existing code style
2. Include comprehensive documentation
3. Add accessibility features
4. Test on multiple devices
5. Update demo page
6. Include TypeScript definitions

## 📞 Support

For issues and questions:

1. Check the demo page for examples
2. Review the API documentation
3. Test with different configurations
4. Report issues with reproduction steps

---

**Agent-OS UI Components** - Modern, accessible, and interactive UI components for the Agent-OS dashboard system.
