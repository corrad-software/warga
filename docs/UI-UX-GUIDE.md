# UI/UX Design System Guide

This document serves as the single source of truth for UI/UX standards in the SPK application.

## Table of Contents
1. [Typography](#typography)
2. [Colors](#colors)
3. [Spacing](#spacing)
4. [Layout Patterns](#layout-patterns)
5. [Components](#components)
6. [Page Structure Standards](#page-structure-standards)

---

## Typography

### Headings
- **Page Title (h1)**: `text-2xl font-bold text-gray-900`
  - Used in: Main page headers (user-facing pages)
  - Example: "Applicant Dashboard", "My Payments"

- **Section Title (h3)**: `text-2xl font-bold text-gray-900`
  - Used in: Admin page titles (using admin layout)
  - Example: "User Management", "Payment Management"

- **Card/Section Headers**: `text-lg font-medium text-gray-900`
  - Used in: Card titles, section headers within pages

### Text Sizes
- **Large Text**: `text-base` (16px)
- **Body Text**: `text-sm` (14px)
- **Small Text**: `text-xs` (12px)
- **Subtitle/Description**: `text-sm text-gray-600`
  - Spacing from title: `mt-1`

---

## Colors

### Text Colors
- **Primary Text**: `text-gray-900`
- **Secondary Text**: `text-gray-600`
- **Tertiary Text**: `text-gray-500`
- **Link**: `text-blue-600 hover:text-blue-800`
- **Link Active**: `text-blue-600`
- **Link Inactive**: `text-gray-700 hover:text-blue-600`

### Background Colors
- **Page Background**: `bg-gray-50`
- **Card/Container**: `bg-white`
- **Header**: `bg-white shadow`
- **Hover**: `hover:bg-gray-50`

### Status Colors
#### Badges/Pills
```
PENDING: 'bg-yellow-100 text-yellow-800'
PROCESSING: 'bg-blue-100 text-blue-800'
COMPLETED: 'bg-green-100 text-green-800'
FAILED: 'bg-red-100 text-red-800'
REFUNDED: 'bg-purple-100 text-purple-800'
```

#### Stat Card Colors
- **Blue**: `bg-blue-500` - Revenue, Total
- **Yellow**: `bg-yellow-500` - Pending, Warning
- **Green**: `bg-green-500` - Completed, Success
- **Red**: `bg-red-500` - Failed, Error
- **Purple**: `bg-purple-500` - Refunded, Special

---

## Spacing

### Page Layout
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Main Content Padding**: `py-8`
- **Header Padding**: `py-4`

### Component Spacing
- **Page Title to Content**: `mb-8`
- **Title to Subtitle**: `mt-1`
- **Card Padding**: `p-5` or `p-6`
- **Section Margins**: `mb-6` or `mb-8`
- **Grid Gap**: `gap-5` or `gap-4`

### Grid Patterns
#### 4-Column Stats
```html
<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
```

#### 2-Column Layout
```html
<div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
```

---

## Layout Patterns

### User-Facing Pages (Dashboard, Payments)
```vue
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Page Title</h1>
            <p class="text-sm text-gray-600">Description</p>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Navigation links -->
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Content here -->
    </main>
  </div>
</template>
```

### Admin Pages (using admin layout)
```vue
<script setup>
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h3 class="text-2xl font-bold text-gray-900">Page Title</h3>
      <p class="mt-1 text-sm text-gray-600">Description</p>
    </div>

    <!-- Content here -->
  </div>
</template>
```

**Key Differences:**
- User pages: Own header with navigation, `h1` title
- Admin pages: No wrapper, `h3` title, layout provides container
- Both: Same font sizes (`text-2xl`), same spacing (`mb-8`, `mt-1`)

---

## Components

### Buttons

#### Primary Button
```html
<button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
  Button Text
</button>
```

#### Secondary Button
```html
<button class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
  Button Text
</button>
```

#### Success Button
```html
<button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
  Verify
</button>
```

#### Danger Button
```html
<button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
  Delete
</button>
```

### Status Badges
```html
<span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
  Active
</span>
```

### Stat Cards (4-Column)
```html
<div class="bg-white overflow-hidden shadow rounded-lg">
  <div class="p-5">
    <div class="flex items-center">
      <div class="flex-shrink-0">
        <div class="rounded-md bg-blue-500 p-3">
          <!-- Icon SVG here -->
        </div>
      </div>
      <div class="ml-5 w-0 flex-1">
        <dl>
          <dt class="text-sm font-medium text-gray-500 truncate">
            Label
          </dt>
          <dd class="flex items-baseline">
            <div class="text-2xl font-semibold text-gray-900">
              Value
            </div>
          </dd>
          <dd class="text-xs text-gray-500 mt-1">
            Subtitle
          </dd>
        </dl>
      </div>
    </div>
  </div>
</div>
```

### Input Fields
```html
<input
  type="text"
  placeholder="Enter text..."
  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
/>
```

### Select Dropdowns
```html
<select class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm">
  <option value="">Select option</option>
</select>
```

### Tables
```html
<div class="bg-white shadow rounded-lg overflow-hidden">
  <table class="min-w-full divide-y divide-gray-200">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Header
        </th>
      </tr>
    </thead>
    <tbody class="bg-white divide-y divide-gray-200">
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          Data
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Page Structure Standards

### ✅ DO
- Use `h1` with `text-2xl` for user-facing page titles
- Use `h3` with `text-2xl` for admin page titles
- Use `mb-8` for page header spacing
- Use `mt-1` for subtitle spacing
- Use `py-8` for main content padding
- Use consistent stat card patterns
- Use 4-column grid for statistics: `grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4`

### ❌ DON'T
- Don't use `h1` with `text-3xl` (too large)
- Don't use `mt-2` or `mb-6` for page headers (inconsistent)
- Don't add container classes to admin pages (layout provides them)
- Don't mix dark mode classes inconsistently
- Don't create duplicate page titles (one in header, one in content)

---

## Quick Reference Checklist

### Creating a New User Page
- [ ] Use `min-h-screen bg-gray-50` wrapper
- [ ] Add header with `bg-white shadow`
- [ ] Use `h1 text-2xl font-bold text-gray-900` for title
- [ ] Add subtitle with `text-sm text-gray-600` and `mt-1`
- [ ] Main content: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
- [ ] No separate page title in content

### Creating a New Admin Page
- [ ] Set `layout: 'admin'` in `definePageMeta`
- [ ] Use plain `<div>` wrapper (no classes)
- [ ] Page header: `mb-8` spacing
- [ ] Use `h3 text-2xl font-bold text-gray-900` for title
- [ ] Add subtitle with `text-sm text-gray-600` and `mt-1`
- [ ] No container classes (layout provides them)

### Creating 4-Column Stats
- [ ] Use grid: `grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4`
- [ ] Each card: `bg-white overflow-hidden shadow rounded-lg`
- [ ] Icon wrapper: `rounded-md bg-[color]-500 p-3`
- [ ] Label: `text-sm font-medium text-gray-500 truncate`
- [ ] Value: `text-2xl font-semibold text-gray-900`
- [ ] Subtitle: `text-xs text-gray-500 mt-1`

---

## Examples

### Example User Page Title
```vue
<h1 class="text-2xl font-bold text-gray-900">My Payments</h1>
<p class="text-sm text-gray-600">View your payment history and transaction details</p>
```

### Example Admin Page Title
```vue
<div class="mb-8">
  <h3 class="text-2xl font-bold text-gray-900">Payment Management</h3>
  <p class="mt-1 text-sm text-gray-600">Manage and monitor all payment transactions</p>
</div>
```

---

## Color Palette Reference

### Primary Colors
- Blue 500: `#3B82F6` - Primary actions, links
- Blue 600: `#2563EB` - Primary button
- Blue 700: `#1D4ED8` - Primary button hover

### Neutral Colors
- Gray 50: `#F9FAFB` - Background
- Gray 100: `#F3F4F6` - Subtle background
- Gray 200: `#E5E7EB` - Borders
- Gray 300: `#D1D5DB` - Input borders
- Gray 500: `#6B7280` - Secondary text
- Gray 600: `#4B5563` - Body text
- Gray 900: `#111827` - Headings

### Status Colors
- Green: Success, Completed, Active
- Yellow: Pending, Warning
- Red: Error, Failed, Danger
- Blue: Processing, Info
- Purple: Special, Refunded

---

*Last Updated: February 2026*
*Maintained by: Development Team*
