<script setup lang="ts">
interface Props {
  modelValue?: string | number
  options: Array<{ value: string | number; label: string }>
  placeholder?: string
  required?: boolean
  disabled?: boolean
  label?: string
  helpText?: string
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select option...',
  required: false,
  disabled: false
})

const emit = defineEmits(['update:modelValue'])

const selectClasses = computed(() => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md shadow-sm bg-white text-sm'
  const focusClasses = 'focus:border-blue-500 focus:ring-blue-500'

  if (props.error) {
    return `${baseClasses} border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500`
  }

  if (props.disabled) {
    return `${baseClasses} border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed`
  }

  return `${baseClasses} border-gray-300 ${focusClasses}`
})
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>

    <select
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :class="selectClasses"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <!-- Help Text or Error -->
    <p v-if="error" class="mt-1 text-sm text-red-600 flex items-center">
      <svg class="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      {{ error }}
    </p>
    <p v-else-if="helpText" class="mt-1 text-xs text-gray-500">{{ helpText }}</p>
  </div>
</template>
