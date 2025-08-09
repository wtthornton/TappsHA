# CSS/TailwindCSS Standards (Agent-OS)

## MANDATORY: TailwindCSS 4.x + shadcn/ui

**ALWAYS** use TailwindCSS 4.x with shadcn/ui components for all styling.

### Technology Stack
- **TailwindCSS**: 4.1+ (latest stable)
- **shadcn/ui**: Latest components
- **Mobile-first**: Responsive design by default
- **Dark mode**: Support for light/dark themes

### Mobile-First Approach
```css
/* ALWAYS use mobile-first approach */
.example-component {
  @apply p-4 text-sm; /* xs: ≤400px */
  
  @apply sm:p-6 sm:text-base; /* sm: 640px+ */
  @apply md:p-8 md:text-lg; /* md: 768px+ */
  @apply lg:p-10 lg:text-xl; /* lg: 1024px+ */
  @apply xl:p-12 xl:text-2xl; /* xl: 1280px+ */
}
```

### Responsive Breakpoints
- **xs**: ≤400px (mobile-first)
- **sm**: 640px+
- **md**: 768px+
- **lg**: 1024px+
- **xl**: 1280px+
- **2xl**: 1536px+

### Component Patterns
```css
/* Card Component */
.metric-card {
  @apply bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20;
  @apply hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300;
}

/* Button Component */
.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700;
  @apply focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Status Indicator */
.status-online {
  @apply flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold;
  @apply bg-gradient-to-r from-green-500 to-green-600 text-white;
}
```

### Color System
```css
/* Primary Colors */
.primary-gradient {
  @apply bg-gradient-to-r from-blue-600 to-purple-600;
}

/* Status Colors */
.status-success { @apply bg-green-500 text-white; }
.status-warning { @apply bg-yellow-500 text-white; }
.status-error { @apply bg-red-500 text-white; }
.status-info { @apply bg-blue-500 text-white; }
```

### Typography
```css
/* Headings */
.heading-1 { @apply text-4xl font-bold text-gray-900; }
.heading-2 { @apply text-3xl font-semibold text-gray-800; }
.heading-3 { @apply text-2xl font-medium text-gray-700; }

/* Body Text */
.body-large { @apply text-lg text-gray-700; }
.body-medium { @apply text-base text-gray-600; }
.body-small { @apply text-sm text-gray-500; }
```

### Layout Patterns
```css
/* Grid Layout */
.metrics-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
}

/* Flex Layout */
.flex-center {
  @apply flex items-center justify-center;
}

.flex-between {
  @apply flex items-center justify-between;
}
```

### Animation & Transitions
```css
/* Smooth Transitions */
.transition-smooth {
  @apply transition-all duration-300 ease-in-out;
}

/* Hover Effects */
.hover-lift {
  @apply hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300;
}

/* Loading Animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Accessibility
```css
/* Focus States */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

/* Screen Reader Only */
.sr-only {
  @apply absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0;
}
```

### Dark Mode Support
```css
/* Dark Mode Classes */
.dark-mode {
  @apply dark:bg-gray-900 dark:text-white;
}

.dark-card {
  @apply dark:bg-gray-800 dark:border-gray-700;
}
```

## CSS Lessons Learned
- **Capture:** Document CSS patterns and responsive design insights
- **Apply:** Update CSS standards based on lessons learned
- **Reference:** See `@~/.agent-os/lessons-learned/categories/development/README.md` for CSS lessons

**Cursor Effect:** Ensures **all AI-generated CSS follows TailwindCSS 4.x patterns** and mobile-first responsive design.
