<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

// State for interactive components
const activeTab = ref('tab1')
const openAccordion = ref<string[]>(['accordion1'])

const toggleAccordion = (id: string) => {
  const index = openAccordion.value.indexOf(id)
  if (index > -1) {
    openAccordion.value.splice(index, 1)
  } else {
    openAccordion.value.push(id)
  }
}

const isAccordionOpen = (id: string) => {
  return openAccordion.value.includes(id)
}
</script>

<template>
  <div>
    <!-- Page Header (Standard Admin Pattern) -->
    <div class="mb-8">
      <h3 class="text-2xl font-bold text-gray-900">UI/UX Kitchen Sink</h3>
      <p class="mt-1 text-sm text-gray-600">
        Component reference and style guide for SPK application
      </p>
    </div>

    <div class="space-y-12">
      <!-- Typography Section -->
      <section>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Typography</h4>
        <div class="bg-white shadow rounded-lg p-6 space-y-4">
          <div>
            <p class="text-xs text-gray-500 mb-2">Page Title (h1 - User Pages)</p>
            <h1 class="text-2xl font-bold text-gray-900">Page Title Example</h1>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-2">Section Title (h3 - Admin Pages)</p>
            <h3 class="text-2xl font-bold text-gray-900">Section Title Example</h3>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-2">Card Header</p>
            <h5 class="text-lg font-medium text-gray-900">Card Header Example</h5>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-2">Subtitle/Description</p>
            <p class="text-sm text-gray-600">This is a subtitle or description text</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-2">Body Text</p>
            <p class="text-sm text-gray-900">This is regular body text content</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-2">Small Text</p>
            <p class="text-xs text-gray-500">This is small helper text</p>
          </div>
        </div>
      </section>

      <!-- 4-Column Stats Grid -->
      <section>
        <h4 class="text-lg font-medium text-gray-900 mb-4">4-Column Statistics Cards</h4>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Blue Card -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="rounded-md bg-blue-500 p-3">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">RM 1,234.56</div>
                    </dd>
                    <dd class="text-xs text-gray-500 mt-1">100 transactions</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Yellow Card -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="rounded-md bg-yellow-500 p-3">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">45</div>
                    </dd>
                    <dd class="text-xs text-gray-500 mt-1">Awaiting review</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Green Card -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="rounded-md bg-green-500 p-3">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">156</div>
                    </dd>
                    <dd class="text-xs text-gray-500 mt-1">Successfully processed</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Red Card -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="rounded-md bg-red-500 p-3">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Failed</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">8</div>
                    </dd>
                    <dd class="text-xs text-gray-500 mt-1">Requires attention</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Buttons -->
      <section>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Buttons</h4>
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex flex-wrap gap-3">
            <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Primary Button
            </button>

            <button class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Secondary Button
            </button>

            <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Success Button
            </button>

            <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Danger Button
            </button>

            <button disabled class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed">
              Disabled Button
            </button>
          </div>
        </div>
      </section>

      <!-- Status Badges -->
      <section>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Status Badges</h4>
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex flex-wrap gap-3">
            <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
              PENDING
            </span>
            <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
              PROCESSING
            </span>
            <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              COMPLETED
            </span>
            <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
              FAILED
            </span>
            <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
              REFUNDED
            </span>
            <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
              DRAFT
            </span>
          </div>
        </div>
      </section>

      <!-- Form Elements -->
      <section>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Form Elements</h4>
        <div class="bg-white shadow rounded-lg p-6 space-y-8">
          <!-- Basic Inputs -->
          <div>
            <h5 class="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Basic Inputs</h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Text Input <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter text..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
                <p class="mt-1 text-xs text-gray-500">This is a helper text</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email Input</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Password Input</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Number Input</label>
                <input
                  type="number"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Date Input</label>
                <input
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Time Input</label>
                <input
                  type="time"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Input with Icons -->
          <div>
            <h5 class="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Input with Icons</h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email with Icon</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">RM</span>
                  </div>
                  <input
                    type="number"
                    placeholder="0.00"
                    class="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">https://</span>
                  </div>
                  <input
                    type="text"
                    placeholder="www.example.com"
                    class="w-full pl-20 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Select & Textarea -->
          <div>
            <h5 class="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Select & Textarea</h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Select Dropdown</label>
                <select class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm">
                  <option value="">Select option...</option>
                  <option value="1">Option 1</option>
                  <option value="2">Option 2</option>
                  <option value="3">Option 3</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Multi-Select</label>
                <select multiple class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm">
                  <option value="1">Option 1</option>
                  <option value="2">Option 2</option>
                  <option value="3">Option 3</option>
                  <option value="4">Option 4</option>
                </select>
              </div>
            </div>

            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Textarea</label>
              <textarea
                rows="4"
                placeholder="Enter description..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">Brief description for your profile. URLs are hyperlinked.</p>
            </div>
          </div>

          <!-- Checkboxes & Radio -->
          <div>
            <h5 class="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Checkboxes & Radio Buttons</h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">Checkboxes</label>
                <div class="space-y-3">
                  <div class="flex items-start">
                    <div class="flex items-center h-5">
                      <input
                        id="checkbox1"
                        type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div class="ml-3 text-sm">
                      <label for="checkbox1" class="font-medium text-gray-700">Email notifications</label>
                      <p class="text-gray-500">Get notified when a comment is posted.</p>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <div class="flex items-center h-5">
                      <input
                        id="checkbox2"
                        type="checkbox"
                        checked
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div class="ml-3 text-sm">
                      <label for="checkbox2" class="font-medium text-gray-700">Push notifications</label>
                      <p class="text-gray-500">Get push notifications on your device.</p>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <div class="flex items-center h-5">
                      <input
                        id="checkbox3"
                        type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div class="ml-3 text-sm">
                      <label for="checkbox3" class="font-medium text-gray-700">SMS notifications</label>
                      <p class="text-gray-500">Get text messages for important updates.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">Radio Buttons</label>
                <div class="space-y-3">
                  <div class="flex items-start">
                    <div class="flex items-center h-5">
                      <input
                        id="radio1"
                        name="radio-example"
                        type="radio"
                        checked
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                    </div>
                    <div class="ml-3 text-sm">
                      <label for="radio1" class="font-medium text-gray-700">Everyone</label>
                      <p class="text-gray-500">Anyone can view this item.</p>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <div class="flex items-center h-5">
                      <input
                        id="radio2"
                        name="radio-example"
                        type="radio"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                    </div>
                    <div class="ml-3 text-sm">
                      <label for="radio2" class="font-medium text-gray-700">Restricted</label>
                      <p class="text-gray-500">Only members can view this.</p>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <div class="flex items-center h-5">
                      <input
                        id="radio3"
                        name="radio-example"
                        type="radio"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                    </div>
                    <div class="ml-3 text-sm">
                      <label for="radio3" class="font-medium text-gray-700">Private</label>
                      <p class="text-gray-500">You are the only one able to view this.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- File Upload -->
          <div>
            <h5 class="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">File Upload</h5>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Basic File Upload</label>
                <input
                  type="file"
                  class="block w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:border-blue-500"
                />
                <p class="mt-1 text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Drag & Drop Area</label>
                <div class="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                  <div class="space-y-1 text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <div class="text-sm text-gray-600">
                      <label class="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload a file</span>
                      </label>
                      <p class="pl-1 inline">or drag and drop</p>
                    </div>
                    <p class="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Input States -->
          <div>
            <h5 class="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Input States</h5>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Success State</label>
                <input
                  type="text"
                  value="Valid input"
                  class="w-full px-3 py-2 border border-green-300 rounded-md text-gray-900 focus:border-green-500 focus:ring-green-500 text-sm"
                />
                <p class="mt-1 text-sm text-green-600 flex items-center">
                  <svg class="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  This input is valid
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Error State</label>
                <input
                  type="text"
                  placeholder="This field has an error"
                  class="w-full px-3 py-2 border border-red-300 rounded-md text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500 text-sm"
                />
                <p class="mt-1 text-sm text-red-600 flex items-center">
                  <svg class="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  This field is required
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Warning State</label>
                <input
                  type="text"
                  value="Check this value"
                  class="w-full px-3 py-2 border border-yellow-300 rounded-md text-gray-900 focus:border-yellow-500 focus:ring-yellow-500 text-sm"
                />
                <p class="mt-1 text-sm text-yellow-600 flex items-center">
                  <svg class="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  Please verify this value
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-500 mb-2">Disabled Input</label>
                <input
                  type="text"
                  placeholder="Disabled input"
                  disabled
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                />
                <p class="mt-1 text-xs text-gray-500">This field cannot be modified</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Read-only Input</label>
                <input
                  type="text"
                  value="Read-only value"
                  readonly
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                />
                <p class="mt-1 text-xs text-gray-500">This field is read-only</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Table -->
      <section>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Table</h4>
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">John Doe</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">john@example.com</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <a href="#" class="text-blue-600 hover:text-blue-900">Edit</a>
                </td>
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Jane Smith</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">jane@example.com</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <a href="#" class="text-blue-600 hover:text-blue-900">Edit</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Alerts/Notifications -->
      <section>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Alerts</h4>
        <div class="space-y-4">
          <div class="rounded-md bg-green-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-green-700">Success! Your changes have been saved.</p>
              </div>
            </div>
          </div>

          <div class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">Error! There was a problem processing your request.</p>
              </div>
            </div>
          </div>

          <div class="rounded-md bg-yellow-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-700">Warning! Please review this information carefully.</p>
              </div>
            </div>
          </div>

          <div class="rounded-md bg-blue-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-blue-700">Info: Here's some helpful information for you.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Loading States -->
      <section>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Loading States</h4>
        <div class="space-y-4">
          <!-- Centered Loading -->
          <div class="bg-white shadow rounded-lg p-12">
            <div class="flex flex-col items-center justify-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
              <p class="text-sm text-gray-600">Loading data...</p>
            </div>
          </div>

          <!-- Inline Loading -->
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex items-center space-x-3">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span class="text-sm text-gray-700">Processing your request...</span>
            </div>
          </div>

          <!-- Loading Skeleton -->
          <div class="bg-white shadow rounded-lg p-6 space-y-3">
            <div class="animate-pulse">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div class="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>

          <!-- Button Loading States -->
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex flex-wrap gap-3">
              <button disabled class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 opacity-50 cursor-not-allowed">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </button>

              <button disabled class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-100 cursor-not-allowed">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Tabs -->
      <section>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Tabs</h4>
        <div class="bg-white shadow rounded-lg p-6">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
              <button
                @click="activeTab = 'tab1'"
                :class="[
                  activeTab === 'tab1'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                ]"
              >
                Profile
              </button>
              <button
                @click="activeTab = 'tab2'"
                :class="[
                  activeTab === 'tab2'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                ]"
              >
                Settings
              </button>
              <button
                @click="activeTab = 'tab3'"
                :class="[
                  activeTab === 'tab3'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                ]"
              >
                Notifications
              </button>
            </nav>
          </div>
          <div class="mt-4">
            <div v-if="activeTab === 'tab1'" class="text-sm text-gray-700">
              <p class="font-medium mb-2">Profile Content</p>
              <p>This is the profile tab content. You can display user information, avatar, bio, and other profile-related details here.</p>
            </div>
            <div v-if="activeTab === 'tab2'" class="text-sm text-gray-700">
              <p class="font-medium mb-2">Settings Content</p>
              <p>This is the settings tab content. Configure application preferences, privacy settings, and account options here.</p>
            </div>
            <div v-if="activeTab === 'tab3'" class="text-sm text-gray-700">
              <p class="font-medium mb-2">Notifications Content</p>
              <p>This is the notifications tab content. Manage notification preferences and view recent alerts here.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Accordion -->
      <section>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Accordion</h4>
        <div class="bg-white shadow rounded-lg divide-y divide-gray-200">
          <!-- Accordion Item 1 -->
          <div>
            <button
              @click="toggleAccordion('accordion1')"
              class="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span class="text-sm font-medium text-gray-900">What is this application?</span>
              <svg
                :class="[isAccordionOpen('accordion1') ? 'rotate-180' : '', 'h-5 w-5 text-gray-500 transform transition-transform']"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div v-if="isAccordionOpen('accordion1')" class="px-6 py-4 bg-gray-50">
              <p class="text-sm text-gray-700">
                This is a comprehensive system for managing applications, payments, and user data. It provides a streamlined workflow for processing submissions and tracking status.
              </p>
            </div>
          </div>

          <!-- Accordion Item 2 -->
          <div>
            <button
              @click="toggleAccordion('accordion2')"
              class="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span class="text-sm font-medium text-gray-900">How do I submit an application?</span>
              <svg
                :class="[isAccordionOpen('accordion2') ? 'rotate-180' : '', 'h-5 w-5 text-gray-500 transform transition-transform']"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div v-if="isAccordionOpen('accordion2')" class="px-6 py-4 bg-gray-50">
              <p class="text-sm text-gray-700">
                Click on the "New Application" button from your dashboard, fill in all required information, upload necessary documents, and submit. You'll receive a confirmation email once submitted.
              </p>
            </div>
          </div>

          <!-- Accordion Item 3 -->
          <div>
            <button
              @click="toggleAccordion('accordion3')"
              class="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span class="text-sm font-medium text-gray-900">What payment methods are accepted?</span>
              <svg
                :class="[isAccordionOpen('accordion3') ? 'rotate-180' : '', 'h-5 w-5 text-gray-500 transform transition-transform']"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div v-if="isAccordionOpen('accordion3')" class="px-6 py-4 bg-gray-50">
              <p class="text-sm text-gray-700">
                We accept various payment methods including credit/debit cards, online banking (FPX), and e-wallets. All transactions are securely processed through certified payment gateways.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Steps/Stepper -->
      <section>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Steps / Wizard</h4>
        <div class="bg-white shadow rounded-lg p-6">
          <nav aria-label="Progress">
            <ol class="flex items-center">
              <!-- Step 1 - Completed -->
              <li class="relative pr-8 sm:pr-20 flex-1">
                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                  <div class="h-0.5 w-full bg-blue-600"></div>
                </div>
                <div class="relative flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full group">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="absolute -bottom-6 text-xs font-medium text-gray-900">Profile</span>
                </div>
              </li>

              <!-- Step 2 - Current -->
              <li class="relative pr-8 sm:pr-20 flex-1">
                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                  <div class="h-0.5 w-full bg-gray-200"></div>
                </div>
                <div class="relative flex items-center justify-center w-8 h-8 border-2 border-blue-600 bg-white rounded-full">
                  <span class="h-2.5 w-2.5 bg-blue-600 rounded-full"></span>
                  <span class="absolute -bottom-6 text-xs font-medium text-blue-600">Documents</span>
                </div>
              </li>

              <!-- Step 3 - Upcoming -->
              <li class="relative pr-8 sm:pr-20 flex-1">
                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                  <div class="h-0.5 w-full bg-gray-200"></div>
                </div>
                <div class="relative flex items-center justify-center w-8 h-8 border-2 border-gray-300 bg-white rounded-full group">
                  <span class="h-2.5 w-2.5 bg-transparent rounded-full group-hover:bg-gray-300"></span>
                  <span class="absolute -bottom-6 text-xs font-medium text-gray-500">Payment</span>
                </div>
              </li>

              <!-- Step 4 - Upcoming -->
              <li class="relative flex-1">
                <div class="relative flex items-center justify-center w-8 h-8 border-2 border-gray-300 bg-white rounded-full group">
                  <span class="h-2.5 w-2.5 bg-transparent rounded-full group-hover:bg-gray-300"></span>
                  <span class="absolute -bottom-6 text-xs font-medium text-gray-500">Review</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </section>

      <!-- Timeline -->
      <section>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Timeline</h4>
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flow-root">
            <ul class="-mb-8">
              <!-- Timeline Item 1 -->
              <li>
                <div class="relative pb-8">
                  <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span class="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                        <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-900">Application <span class="font-medium">submitted</span></p>
                        <p class="mt-0.5 text-xs text-gray-500">Your application has been received and is under review</p>
                      </div>
                      <div class="text-right text-xs whitespace-nowrap text-gray-500">
                        2 days ago
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <!-- Timeline Item 2 -->
              <li>
                <div class="relative pb-8">
                  <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-900">Documents <span class="font-medium">verified</span></p>
                        <p class="mt-0.5 text-xs text-gray-500">All required documents have been verified</p>
                      </div>
                      <div class="text-right text-xs whitespace-nowrap text-gray-500">
                        1 day ago
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <!-- Timeline Item 3 -->
              <li>
                <div class="relative pb-8">
                  <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span class="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
                        <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-900">Payment <span class="font-medium">pending</span></p>
                        <p class="mt-0.5 text-xs text-gray-500">Awaiting payment confirmation</p>
                      </div>
                      <div class="text-right text-xs whitespace-nowrap text-gray-500">
                        5 hours ago
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <!-- Timeline Item 4 -->
              <li>
                <div class="relative">
                  <div class="relative flex space-x-3">
                    <div>
                      <span class="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                        <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-500">Final approval pending</p>
                        <p class="mt-0.5 text-xs text-gray-500">Will be processed after payment confirmation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Breadcrumbs -->
      <section>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Breadcrumbs</h4>
        <div class="bg-white shadow rounded-lg p-6">
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
              <li>
                <div>
                  <a href="#" class="text-gray-400 hover:text-gray-500">
                    <svg class="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span class="sr-only">Home</span>
                  </a>
                </div>
              </li>
              <li>
                <div class="flex items-center">
                  <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                  <a href="#" class="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700">Applications</a>
                </div>
              </li>
              <li>
                <div class="flex items-center">
                  <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                  <a href="#" class="ml-2 text-sm font-medium text-gray-900" aria-current="page">Application Details</a>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </section>

      <!-- Pagination -->
      <section>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Pagination</h4>
        <div class="bg-white shadow rounded-lg p-6">
          <nav class="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
            <div class="-mt-px w-0 flex-1 flex">
              <a href="#" class="border-t-2 border-transparent pt-4 pr-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                <svg class="mr-3 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
                Previous
              </a>
            </div>
            <div class="hidden md:-mt-px md:flex">
              <a href="#" class="border-blue-500 text-blue-600 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium">1</a>
              <a href="#" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium">2</a>
              <a href="#" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium">3</a>
              <span class="border-transparent text-gray-500 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium">...</span>
              <a href="#" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium">8</a>
              <a href="#" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium">9</a>
              <a href="#" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium">10</a>
            </div>
            <div class="-mt-px w-0 flex-1 flex justify-end">
              <a href="#" class="border-t-2 border-transparent pt-4 pl-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Next
                <svg class="ml-3 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </a>
            </div>
          </nav>
        </div>
      </section>

      <!-- Progress Bars -->
      <section>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Progress Bars</h4>
        <div class="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-sm font-medium text-gray-700">Progress</span>
              <span class="text-sm font-medium text-gray-700">45%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-blue-600 h-2.5 rounded-full" style="width: 45%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between mb-1">
              <span class="text-sm font-medium text-green-700">Success</span>
              <span class="text-sm font-medium text-green-700">75%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-green-600 h-2.5 rounded-full" style="width: 75%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between mb-1">
              <span class="text-sm font-medium text-yellow-700">Warning</span>
              <span class="text-sm font-medium text-yellow-700">60%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-yellow-500 h-2.5 rounded-full" style="width: 60%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between mb-1">
              <span class="text-sm font-medium text-red-700">Error</span>
              <span class="text-sm font-medium text-red-700">30%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-red-600 h-2.5 rounded-full" style="width: 30%"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Dividers -->
      <section>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Dividers</h4>
        <div class="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <p class="text-sm text-gray-700 mb-3">Simple divider</p>
            <div class="border-t border-gray-200"></div>
          </div>

          <div>
            <p class="text-sm text-gray-700 mb-3">Divider with text</p>
            <div class="relative">
              <div class="absolute inset-0 flex items-center" aria-hidden="true">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center">
                <span class="px-2 bg-white text-sm text-gray-500">Continue</span>
              </div>
            </div>
          </div>

          <div>
            <p class="text-sm text-gray-700 mb-3">Divider with button</p>
            <div class="relative">
              <div class="absolute inset-0 flex items-center" aria-hidden="true">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center">
                <button class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
