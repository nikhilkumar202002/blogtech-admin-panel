# BLOGTECH Admin Panel - Complete Frontend & Styling Documentation

Welcome to the official frontend technical documentation for the **BLOGTECH Admin Panel**. This guide covers the architectural patterns, styling design system, component hierarchy, page view operations, state management, and responsive utilities across the entire web application.

---

## 📚 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Routing & State Persistence](#2-routing--state-persistence)
3. [Design System & Styling Guide](#3-design-system--styling-guide)
4. [Responsive Design System](#4-responsive-design-system)
5. [Layout & Structural Components](#5-layout--structural-components)
6. [UI Components Library](#6-ui-components-library)
7. [Page Views & Operating Modules](#7-page-views--operating-modules)
8. [Data Flow & Operations](#8-data-flow--operations)

---

## 1. Architecture Overview

The BLOGTECH Admin Panel is built as a high-performance Single-Page Application (SPA) designed for managing company blog content, career openings, candidate applications, and contact enquiries.

### Technology Stack:
- **Core Library**: React 18+ (Functional Components & React Hooks)
- **Build Tooling**: Vite 8 (Ultra-fast HMR and production bundle optimization)
- **Icons**: Lucide React (`lucide-react`)
- **Styling**: Modern Vanilla CSS Design System with HSL tailored variables, glassmorphism, and responsive utilities (`src/index.css`)
- **Typography**: Inter (Google Fonts via standard web import)

### Component Tree Overview:
```
App (ToastProvider wrapper)
 └── MainApp
      ├── Layout
      │    ├── Sidebar (Fixed 256px / 72px / Mobile Drawer)
      │    └── Main Container (margin-left offset wrapper)
      │         ├── Header (Sticky top navigation bar)
      │         └── Main Content Area (Dynamic page children)
      │              ├── DashboardView
      │              ├── CareersView
      │              ├── BlogsView
      │              ├── EnquiriesView
      │              └── SettingsView
      ├── CommandPalette (Global Cmd + K trigger)
      ├── Modal (Publishing Deployment Sync)
      └── ConfirmDialog (Logout & Delete confirmations)
```

---

## 2. Routing & State Persistence

The application uses the HTML5 History API (`window.history.pushState` and `window.addEventListener('popstate')`) combined with `localStorage` to deliver clean URL routes without hashtags.

### Supported Clean URL Routes:
| Route Path | Active View Component | Description |
| :--- | :--- | :--- |
| `http://localhost:5173/` | `DashboardView` | Overview statistics, recent activity, quick actions |
| `http://localhost:5173/careers` | `CareersView` | Job openings CRUD, applicant management |
| `http://localhost:5173/blogs` | `BlogsView` | Blog article CMS, Rich Text editor, public preview |
| `http://localhost:5173/enquiries` | `EnquiriesView` | Customer contact form submissions inbox |
| `http://localhost:5173/settings` | `SettingsView` | System branding, team members, SEO & security |

### Refresh & Browser Navigation Behavior:
- **Page Reload (F5 / Reload)**: Reads `window.location.pathname` or fallback `localStorage.getItem('blogtech_active_tab')` on initial mount to restore the user's exact current tab.
- **Browser Back / Forward**: Managed via `popstate` event listener in `App.jsx`, ensuring browser history navigation works seamlessly.
- **Legacy Hash Compatibility**: Automatically converts hash links (e.g. `/#blogs`) to clean pathnames (`/blogs`) via `window.history.replaceState`.

---

## 3. Design System & Styling Guide

The styling system is centralized in `src/index.css` using curated CSS custom properties (variables) for consistent themes, typography, shadows, borders, and animations.

### Design Tokens (`src/index.css`):

```css
:root {
  /* Color Palette - Premium Light SaaS */
  --bg-app: #f8fafc;
  --bg-surface: #ffffff;
  --bg-surface-hover: #f1f5f9;
  --bg-subtle: #f8fafc;
  
  --text-primary: #0f172a;      /* Dark Charcoal */
  --text-secondary: #475569;    /* Muted Slate */
  --text-muted: #94a3b8;        /* Soft Secondary */
  --text-inverse: #ffffff;

  --border-subtle: #f1f5f9;
  --border-main: #e2e8f0;
  --border-strong: #cbd5e1;

  /* Accent & Primary Colors */
  --primary: #0f172a;
  --primary-hover: #1e293b;
  --accent: #4f46e5;            /* Indigo Accent */
  --accent-light: #eef2ff;
  --accent-hover: #4338ca;

  /* Status Colors */
  --status-active-bg: #ecfdf5;
  --status-active-text: #047857;
  --status-active-border: #a7f3d0;

  --status-draft-bg: #fffbeb;
  --status-draft-text: #b45309;
  --status-draft-border: #fde68a;

  --status-danger-bg: #fef2f2;
  --status-danger-text: #b91c1c;
  --status-danger-border: #fca5a5;

  /* Radius System */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

### Core Helper Classes:
- `.card`: Standard surface container with border `#e2e8f0`, border-radius `12px`, subtle hover transition.
- `.card-padded`: Applies standard `20px` internal padding.
- `.animate-pop-in`: Keyframe animation for dropdowns, tooltips, and modals (`scale(0.96) -> scale(1)` + fade).
- `.animate-fade-in`: Smooth entrance fade animation for page views.

---

## 4. Responsive Design System

The application is engineered for fluid responsiveness across desktop, tablet, and mobile displays.

### Responsive Breakpoints:
- **Desktop (>= 1024px)**: Full fixed sidebar width `256px` (or `72px` collapsed), full table layouts, multi-column grid dashboards.
- **Tablet / Small Laptop (769px - 1023px)**: Auto-adjusting single-row filter toolbars, flexible table column widths.
- **Mobile (<= 768px)**:
  - Sidebar converts to offscreen drawer (`transform: translateX(-100%)` with `.mobile-drawer-open`).
  - `.layout-main-container` resets `margin-left: 0 !important` to eliminate blank gaps.
  - Multi-column grids convert to 1 column via `.mobile-grid-1`.
  - Header actions collapse into compact touch targets via `.hide-on-mobile` and `.show-on-mobile`.

### Utility Class Rules (`src/index.css`):
```css
/* Hidden on desktop by default, displayed only on mobile */
.show-on-mobile {
  display: none !important;
}

@media (max-width: 768px) {
  .layout-main-container,
  .layout-main-container.sidebar-collapsed {
    margin-left: 0 !important;
  }
  .hide-on-mobile {
    display: none !important;
  }
  .show-on-mobile {
    display: flex !important;
  }
  .mobile-grid-1 {
    grid-template-columns: 1fr !important;
  }
  .mobile-stack {
    flex-direction: column !important;
    align-items: stretch !important;
  }
}
```

---

## 5. Layout & Structural Components

### `<Layout />` (`src/components/layout/Layout.jsx`)
Acts as the global structural shell that persists `<Sidebar />` and `<Header />` across page changes while accepting dynamic page views via React `children`.

**Props:**
- `activeTab` (`string`): Current active route (`dashboard`, `careers`, `blogs`, `enquiries`, `settings`).
- `sidebarCollapsed` (`boolean`): Toggles desktop sidebar between `256px` expanded and `72px` collapsed width.
- `isMobileOpen` (`boolean`): Controls mobile sidebar drawer overlay visibility.
- `children` (`ReactNode`): Page content rendered inside `<main className="main-content-area">`.

---

### `<Sidebar />` (`src/components/layout/Sidebar.jsx`)
Modern SaaS sidebar navigation featuring brand logo switching, organized section headers, active strip indicators, and collapsed mode tooltips.

**Key Features:**
- **Brand Switching**: Displays `/MAIN-LOGO.png` when expanded and `/fav-icon.jpg` when collapsed.
- **Navigation Groups**:
  - *Main*: Dashboard
  - *Content & Hiring*: Careers, Blogs, Enquiries
  - *Management*: Settings
- **Badges**: Real-time counter badges for active job openings, published blogs, and unread enquiries.
- **Collapse State**: Dynamic toggle collapsing width to `72px` while retaining icon navigation.

---

### `<Header />` (`src/components/layout/Header.jsx`)
Sticky top header (`height: 64px`, `position: sticky`) providing instant application-wide controls.

**Key Features:**
- **Mobile Menu Button**: Triggers mobile sidebar drawer on small screens.
- **Quick Command Search**: Opens Command Palette (`⌘K`).
- **Publish Site Status Button**: Visual indicator for pending changes (`Publish Site Changes` / `Site Synced`).
- **Live Site Trigger**: Direct link to production public site (`https://apexcorp.com`).
- **Notifications Popover**: Interactive bell popover listing recent system alerts with unread badge counter.
- **Admin Profile Menu**: Dropdown menu for Super Admin options and Logout trigger.

---

### `<Breadcrumb />` (`src/components/ui/Breadcrumb.jsx`)
Clean, minimal single-line breadcrumb component following standard admin design rules.

**Usage Example:**
```jsx
<Breadcrumb
  items={[
    { label: 'Dashboard', onClick: () => setActiveTab('dashboard') },
    { label: 'Blogs', onClick: () => setViewMode('list') },
    { label: 'Create Article' },
  ]}
/>
```

---

## 6. UI Components Library

Located in `src/components/ui/`, these atomic components power the interface:

1. **`Button` (`Button.jsx`)**:
   - Variants: `primary`, `secondary`, `accent`, `ghost`, `danger`, `outline`.
   - Supports `icon`, `iconPosition`, `size` (`sm`, `md`, `lg`), `loading`, `fullWidth`.
2. **`DataTable` (`DataTable.jsx`)**:
   - Clean data table with built-in sorting, row selection checkboxes, pagination controls, custom cell rendering, and empty state fallbacks.
3. **`Badge` (`Badge.jsx`)**:
   - Status indicators (`Active`, `Closed`, `Published`, `Draft`, `Unpublished`, `Unread`, `Read`, `Success`, `Accent`).
4. **`DropdownMenu` (`DropdownMenu.jsx`)**:
   - Contextual actions dropdown supporting items with icons, dividers, danger state styling, and click-outside dismissal.
5. **`Modal` & `ConfirmDialog`**:
   - Accessible modal overlay dialogs for confirmation prompts and complex workflows.
6. **`RichTextEditor` (`RichTextEditor.jsx`)**:
   - Formatting toolbar for article body content (headings, bold, italic, lists, blockquotes, code blocks, links).
7. **`ImageUploader` (`ImageUploader.jsx`)**:
   - Featured image upload component with live image preview and URL override option.
8. **`ToastContext` (`ToastContext.jsx`)**:
   - Application-wide toast notification system (`addToast({ title, message, type })`).

---

## 7. Page Views & Operating Modules

### 1. Dashboard View (`DashboardView.jsx`)
- **Key Metrics**: 4 summary cards (Active Careers, Closed Careers, Published Blogs, Draft Blogs).
- **Recent Activity**: Quick view tables for latest job openings and latest blog posts.
- **Quick Actions Panel**: Direct modal triggers for adding job openings and creating blog posts.
- **Live Feed**: Activity audit log displaying recent user actions.

### 2. Careers View (`CareersView.jsx`)
- **Toolbar**: Single-row filter bar containing Search, Status filter, Location filter, Experience filter, and Sort dropdown.
- **Data Table**: Columns for Job Title, Location, Department, Type, Applicants count, Status, and Actions dropdown.
- **Applicant Modal**: Dedicated applicant inspector view showing candidate resumes, contact details, applied dates, and candidate status.
- **Job Form Modal**: Create/edit modal for publishing new career opportunities.

### 3. Blogs View (`BlogsView.jsx`)
- **View Modes**:
  1. `list`: Single-row filter toolbar, article table with featured image thumbnail, title, category, publication date, status badge, and action dropdown.
  2. `form`: Full CMS article editor with title, automatic slug generation, rich text body editor, collapsible SEO settings (meta title & description), category select, publication date picker, and featured image uploader.
  3. `preview`: Public simulator mode allowing administrators to preview exact end-user article layout before publishing.

### 4. Enquiries View (`EnquiriesView.jsx`)
- **Toolbar**: Search input and quick status filter tabs (`All`, `Unread`, `Read`, `Archived`).
- **Data Table**: Displays sender name, email, subject, received date, and unread status.
- **Enquiry Drawer**: Slide-over drawer inspecting complete enquiry body content with reply and archive controls.

### 5. Settings View (`SettingsView.jsx`)
- **Tabs**:
  - *General & Branding*: Site title, company logo, primary colors, support contact email.
  - *Team Members*: Manage administrative accounts, roles, and security access.
  - *SEO & Social*: Default meta tags, social preview card images, Google Analytics ID.
  - *Security*: Active sessions log, force sign-out all sessions.

---

## 8. Data Flow & Operations

### State Management (`App.jsx`):
Core administrative data is maintained at the root `MainApp` level and updated immutably:
- `stats`: Site statistics & publishing status (`Changes Pending` / `Synced`).
- `jobs`: Array of career job opening objects.
- `applicants`: Array of candidate application records linked to job IDs.
- `blogs`: Array of blog article objects.
- `enquiries`: Array of contact submission objects.
- `publishingLogs`: Production deploy history records.

### Website Publishing Sync Workflow:
1. When a user creates or modifies a job or blog post, `stats.publishingStatus` automatically updates to `'Changes Pending'`.
2. The sticky header displays the highlighted **"Publish Site Changes"** accent button.
3. Clicking **Publish** opens the confirmation modal detailing all pending active careers, published blogs, and SEO changes ready for sync.
4. Confirming deployment appends a new record to `publishingLogs` with author name, commit hash, timestamp, and resets `stats.publishingStatus` back to `'Synced'`.

---

*Documentation compiled and maintained for BLOGTECH Admin Panel.*
