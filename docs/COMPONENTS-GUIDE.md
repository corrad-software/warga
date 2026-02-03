# Form Components Guide

This guide shows how to use the standardized form components across the application.

## Why Use Components?

Instead of repeating the same long class names everywhere:
```vue
<!-- ❌ Old way - repetitive -->
<input
  type="text"
  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
/>
```

You can use clean, reusable components:
```vue
<!-- ✅ New way - clean and consistent -->
<FormInput type="text" />
```

## Available Components

All components are auto-imported from the `components/form/` directory.

### FormInput

Text inputs with built-in label, validation, icons, and help text.

#### Basic Usage
```vue
<FormInput
  v-model="email"
  type="email"
  label="Email Address"
  placeholder="Enter your email"
  required
/>
```

#### With Icon
```vue
<FormInput
  v-model="email"
  type="email"
  label="Email Address"
  placeholder="you@example.com"
  icon="email"
  required
/>
```

#### With Prefix
```vue
<FormInput
  v-model="amount"
  type="number"
  label="Amount"
  prefix="RM"
  placeholder="0.00"
/>
```

#### With Error
```vue
<FormInput
  v-model="name"
  label="Full Name"
  error="This field is required"
  required
/>
```

#### With Help Text
```vue
<FormInput
  v-model="username"
  label="Username"
  help-text="Choose a unique username"
/>
```

#### Props
- `v-model`: Bind the input value
- `type`: Input type (text, email, password, tel, number, date, time, url)
- `label`: Field label
- `placeholder`: Placeholder text
- `required`: Show red asterisk and make field required
- `disabled`: Disable the input
- `readonly`: Make input read-only
- `icon`: Show icon (email, search, phone, lock)
- `prefix`: Text prefix (like currency)
- `help-text`: Helper text below input
- `error`: Error message (shows red styling)

### FormSelect

Dropdown select with consistent styling.

#### Basic Usage
```vue
<FormSelect
  v-model="applicationType"
  label="Application Type"
  :options="applicationTypes"
  placeholder="Select application type..."
  required
/>
```

#### In Script
```ts
const applicationTypes = [
  { value: 'BORANG_H', label: 'Borang H - Birth Abroad' },
  { value: 'BORANG_G', label: 'Borang G - Article 15(2) Fastlane' },
  { value: 'TADBIR_SUMPAH', label: 'Tadbir Sumpah - Oath Administration' }
]
```

#### Props
- `v-model`: Bind the selected value
- `label`: Field label
- `options`: Array of {value, label} objects
- `placeholder`: Default option text
- `required`: Show red asterisk and make field required
- `disabled`: Disable the select
- `help-text`: Helper text below select
- `error`: Error message

### FormTextarea

Multi-line text input.

#### Basic Usage
```vue
<FormTextarea
  v-model="description"
  label="Description"
  placeholder="Enter description..."
  :rows="4"
  required
/>
```

#### Props
- `v-model`: Bind the textarea value
- `label`: Field label
- `placeholder`: Placeholder text
- `rows`: Number of rows (default: 4)
- `required`: Show red asterisk and make field required
- `disabled`: Disable the textarea
- `readonly`: Make textarea read-only
- `help-text`: Helper text below textarea
- `error`: Error message

### FormButton

Consistent button styling with loading states.

#### Primary Button
```vue
<FormButton type="submit" :loading="loading">
  Create Application
</FormButton>
```

#### Secondary Button
```vue
<FormButton variant="secondary" @click="cancel">
  Cancel
</FormButton>
```

#### Danger Button
```vue
<FormButton variant="danger" @click="deleteItem">
  Delete
</FormButton>
```

#### With Loading State
```vue
<FormButton type="submit" :loading="isSubmitting">
  {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
</FormButton>
```

#### Props
- `type`: Button type (button, submit, reset)
- `variant`: Style variant (primary, secondary, danger, ghost)
- `size`: Button size (sm, md, lg)
- `loading`: Show loading spinner
- `disabled`: Disable button

## Complete Form Example

```vue
<script setup lang="ts">
const form = ref({
  name: '',
  email: '',
  type: '',
  description: ''
})

const loading = ref(false)
const errors = ref<Record<string, string>>({})

const applicationTypes = [
  { value: 'BORANG_H', label: 'Borang H - Birth Abroad' },
  { value: 'BORANG_G', label: 'Borang G - Article 15(2) Fastlane' }
]

const handleSubmit = async () => {
  loading.value = true
  // Submit logic
  loading.value = false
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6 space-y-6">
      <FormInput
        v-model="form.name"
        label="Full Name"
        placeholder="Enter full name"
        :error="errors.name"
        required
      />

      <FormInput
        v-model="form.email"
        type="email"
        label="Email Address"
        placeholder="email@example.com"
        icon="email"
        :error="errors.email"
        required
      />

      <FormSelect
        v-model="form.type"
        label="Application Type"
        :options="applicationTypes"
        :error="errors.type"
        required
      />

      <FormTextarea
        v-model="form.description"
        label="Description"
        placeholder="Enter description..."
        help-text="Brief description of your application"
        :error="errors.description"
        required
      />
    </div>

    <div class="px-4 py-3 bg-gray-50 text-right sm:px-6 rounded-b-lg space-x-3">
      <FormButton variant="secondary" @click="$router.back()">
        Cancel
      </FormButton>
      <FormButton type="submit" :loading="loading">
        Submit Application
      </FormButton>
    </div>
  </form>
</template>
```

## Benefits

1. **Consistency**: All forms look and behave the same
2. **Less Code**: No need to repeat long class names
3. **Easy Updates**: Change styling in one place
4. **Built-in Features**: Labels, validation, icons, errors automatically handled
5. **Type Safety**: Full TypeScript support

## Migration Guide

To convert an existing form:

### Before
```vue
<label class="block text-sm font-medium text-gray-700 mb-2">
  Email <span class="text-red-500">*</span>
</label>
<input
  v-model="email"
  type="email"
  required
  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
/>
```

### After
```vue
<FormInput
  v-model="email"
  type="email"
  label="Email"
  required
/>
```

That's it! The component handles all the styling automatically.
