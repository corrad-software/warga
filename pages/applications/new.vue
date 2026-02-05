<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { token } = useAuth()
const router = useRouter()

const currentStep = ref(1) // Step 1: Choose type, Step 2: Parent info, Step 3: Baby info, Step 4: Review

const form = ref({
  type: '',

  // Step 2: Parent/Guardian Information
  parentInfo: {
    motherName: '',
    motherIdentityType: 'MYKAD', // MYKAD or PASSPORT
    motherIC: '',
    motherPassportNo: '',
    motherNationality: '',
    motherPhoneNumber: '',
    motherEmail: '',
    motherAddress: '',

    fatherName: '',
    fatherIdentityType: 'MYKAD',
    fatherIC: '',
    fatherPassportNo: '',
    fatherNationality: '',
    fatherPhoneNumber: '',
    fatherEmail: '',
    fatherAddress: ''
  },

  // Step 3: Child/Baby Information
  childInfo: {
    fullName: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    hospitalName: '',
    stateOfBirth: '',
    countryOfBirth: '',
    gender: '',
    birthCertificateNo: '',
    birthCertificateIssueDate: '',
    currentAddress: '',
    reasonForApplication: ''
  }
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

const applicationTypes = [
  {
    value: 'BORANG_G',
    label: 'Borang G',
    subtitle: 'Article 15(2) Fastlane',
    description: 'For children born outside Malaysia to Malaysian mothers. Fast-track citizenship application under Article 15(2) of the Federal Constitution.',
    icon: 'rocket',
    enabled: true,
    estimatedDays: '60-90 days'
  },
  {
    value: 'BORANG_H',
    label: 'Borang H',
    subtitle: 'Birth Abroad (Kelahiran Luar Negara)',
    description: 'For children born abroad to Malaysian parents. Registration of citizenship by operation of law under Article 14.',
    icon: 'globe',
    enabled: false,
    estimatedDays: '90-120 days',
    comingSoon: true
  },
  {
    value: 'TADBIR_SUMPAH',
    label: 'Tadbir Sumpah',
    subtitle: 'Oath Administration',
    description: 'For approved applicants to take the oath of allegiance and loyalty to complete the citizenship process.',
    icon: 'document',
    enabled: false,
    estimatedDays: '30 days',
    comingSoon: true
  }
]

const selectApplicationType = (type: string, enabled: boolean) => {
  if (!enabled) return
  form.value.type = type
  currentStep.value = 2
}

const backToSelection = () => {
  currentStep.value = 1
}

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleSubmit = async () => {
  if (!form.value.type) {
    error.value = 'Please select an application type'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/applications', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        type: form.value.type,
        formData: {
          parentInfo: form.value.parentInfo,
          childInfo: form.value.childInfo
        }
      }
    })

    if (response.success) {
      success.value = true
      // Redirect to application detail page
      setTimeout(() => {
        router.push(`/applications/${response.data.application.id}`)
      }, 1500)
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to create application'
  } finally {
    loading.value = false
  }
}

const handleSaveDraft = async () => {
  await handleSubmit()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Left: Logo and System Name -->
          <div class="flex items-center space-x-3">
            <img src="/images/jpn_logo.png" alt="JPN Logo" class="h-10 w-auto" />
            <div>
              <h1 class="text-lg font-bold text-gray-900">SPK</h1>
              <p class="text-xs text-gray-600">Sistem Pengurusan Kewarganegaraan</p>
            </div>
          </div>

          <!-- Right: Menu -->
          <nav class="flex items-center space-x-6">
            <NuxtLink
              to="/dashboard"
              class="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              My Applications
            </NuxtLink>
            <NuxtLink
              to="/payments"
              class="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              My Payments
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Back Button and Page Title -->
      <div class="mb-8 flex items-center">
        <button
          @click="router.push('/dashboard')"
          class="mr-4 text-gray-600 hover:text-gray-900"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 class="text-3xl font-bold text-gray-900">New Citizenship Application</h2>
          <p class="text-gray-600 mt-2">Submit a new citizenship application</p>
        </div>
      </div>

      <!-- Step Indicator -->
      <nav aria-label="Progress" class="mb-8">
        <ol class="flex items-center justify-center">
          <!-- Step 1 -->
          <li class="relative pr-8 sm:pr-12">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full" :class="currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'"></div>
            </div>
            <div
              class="relative flex items-center justify-center w-10 h-10 rounded-full"
              :class="currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-200'"
            >
              <svg v-if="currentStep > 1" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span v-else class="text-white font-semibold">1</span>
            </div>
            <span class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap" :class="currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'">
              Choose Type
            </span>
          </li>

          <!-- Step 2 -->
          <li class="relative pr-8 sm:pr-12">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full" :class="currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'"></div>
            </div>
            <div
              class="relative flex items-center justify-center w-10 h-10 rounded-full"
              :class="currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'"
            >
              <svg v-if="currentStep > 2" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span v-else class="text-white font-semibold">2</span>
            </div>
            <span class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap" :class="currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'">
              Parent Details
            </span>
          </li>

          <!-- Step 3 -->
          <li class="relative pr-8 sm:pr-12">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full" :class="currentStep >= 4 ? 'bg-blue-600' : 'bg-gray-200'"></div>
            </div>
            <div
              class="relative flex items-center justify-center w-10 h-10 rounded-full"
              :class="currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'"
            >
              <svg v-if="currentStep > 3" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span v-else class="text-white font-semibold">3</span>
            </div>
            <span class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap" :class="currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'">
              Child Details
            </span>
          </li>

          <!-- Step 4 -->
          <li class="relative">
            <div
              class="relative flex items-center justify-center w-10 h-10 rounded-full"
              :class="currentStep >= 4 ? 'bg-blue-600' : 'bg-gray-200'"
            >
              <span class="text-white font-semibold">4</span>
            </div>
            <span class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap" :class="currentStep >= 4 ? 'text-blue-600' : 'text-gray-500'">
              Review
            </span>
          </li>
        </ol>
      </nav>

      <!-- Success Message -->
      <div v-if="success" class="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="ml-3">
            <p class="text-sm font-medium text-green-800">
              Application created successfully! Redirecting...
            </p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Step 1: Choose Application Type -->
      <div v-if="currentStep === 1">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900">Choose Application Type</h2>
          <p class="mt-2 text-sm text-gray-600">Select the type of citizenship application you wish to submit</p>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div
            v-for="type in applicationTypes"
            :key="type.value"
            @click="selectApplicationType(type.value, type.enabled)"
            class="relative bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-200"
            :class="type.enabled ? 'cursor-pointer hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-blue-500' : 'opacity-60 cursor-not-allowed'"
          >
            <!-- Coming Soon Badge -->
            <div v-if="type.comingSoon" class="absolute top-4 right-4 z-10">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Coming Soon
              </span>
            </div>

            <div class="p-6">
              <!-- Icon -->
              <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full" :class="type.enabled ? 'bg-blue-100' : 'bg-gray-100'">
                <!-- Rocket Icon for Borang G -->
                <svg v-if="type.icon === 'rocket'" class="w-8 h-8" :class="type.enabled ? 'text-blue-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <!-- Globe Icon for Borang H -->
                <svg v-else-if="type.icon === 'globe'" class="w-8 h-8" :class="type.enabled ? 'text-blue-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <!-- Document Icon for Tadbir Sumpah -->
                <svg v-else class="w-8 h-8" :class="type.enabled ? 'text-blue-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <!-- Title -->
              <h3 class="text-xl font-bold text-center mb-1" :class="type.enabled ? 'text-gray-900' : 'text-gray-500'">
                {{ type.label }}
              </h3>
              <p class="text-sm text-center font-medium mb-4" :class="type.enabled ? 'text-blue-600' : 'text-gray-400'">
                {{ type.subtitle }}
              </p>

              <!-- Description -->
              <p class="text-sm text-gray-600 text-center mb-4 min-h-[60px]">
                {{ type.description }}
              </p>

              <!-- Estimated Time -->
              <div class="flex items-center justify-center text-xs text-gray-500 mb-4">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Est. {{ type.estimatedDays }}
              </div>

              <!-- Select Button -->
              <button
                v-if="type.enabled"
                type="button"
                class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Select This Type
              </button>
              <button
                v-else
                type="button"
                disabled
                class="w-full py-2 px-4 bg-gray-300 text-gray-500 text-sm font-medium rounded-md cursor-not-allowed"
              >
                Not Available
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Parent/Guardian Information -->
      <div v-if="currentStep === 2" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6 space-y-6">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Parent/Guardian Information</h2>
            <p class="mt-2 text-sm text-gray-600">Please provide details for both mother and father</p>
          </div>

          <!-- Mother's Information -->
          <div class="border-t border-gray-200 pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mother's Information
            </h3>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.parentInfo.motherName"
                  type="text"
                  placeholder="Enter mother's full name"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <!-- Identity Type Selection -->
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Identity Type <span class="text-red-500">*</span>
                </label>
                <div class="flex gap-4">
                  <label class="flex items-center">
                    <input
                      v-model="form.parentInfo.motherIdentityType"
                      type="radio"
                      value="MYKAD"
                      class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">MyKad</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="form.parentInfo.motherIdentityType"
                      type="radio"
                      value="PASSPORT"
                      class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">Passport</span>
                  </label>
                </div>
              </div>

              <!-- MyKad or Passport Number -->
              <div v-if="form.parentInfo.motherIdentityType === 'MYKAD'" class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  MyKad Number <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.parentInfo.motherIC"
                  type="text"
                  placeholder="e.g., 901234-56-7890"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div v-if="form.parentInfo.motherIdentityType === 'PASSPORT'" class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Passport Number <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.parentInfo.motherPassportNo"
                  type="text"
                  placeholder="e.g., A12345678"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nationality <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.parentInfo.motherNationality"
                  type="text"
                  placeholder="e.g., Malaysian"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.parentInfo.motherPhoneNumber"
                  type="tel"
                  placeholder="+60123456789"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.parentInfo.motherEmail"
                  type="email"
                  placeholder="email@example.com"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Address <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="form.parentInfo.motherAddress"
                  rows="3"
                  placeholder="Enter mother's current address"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Father's Information -->
          <div class="border-t border-gray-200 pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Father's Information
            </h3>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.parentInfo.fatherName"
                  type="text"
                  placeholder="Enter father's full name"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <!-- Identity Type Selection -->
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Identity Type <span class="text-red-500">*</span>
                </label>
                <div class="flex gap-4">
                  <label class="flex items-center">
                    <input
                      v-model="form.parentInfo.fatherIdentityType"
                      type="radio"
                      value="MYKAD"
                      class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">MyKad</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="form.parentInfo.fatherIdentityType"
                      type="radio"
                      value="PASSPORT"
                      class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">Passport</span>
                  </label>
                </div>
              </div>

              <!-- MyKad or Passport Number -->
              <div v-if="form.parentInfo.fatherIdentityType === 'MYKAD'" class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  MyKad Number <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.parentInfo.fatherIC"
                  type="text"
                  placeholder="e.g., 901234-56-7890"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div v-if="form.parentInfo.fatherIdentityType === 'PASSPORT'" class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Passport Number <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.parentInfo.fatherPassportNo"
                  type="text"
                  placeholder="e.g., A12345678"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nationality <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.parentInfo.fatherNationality"
                  type="text"
                  placeholder="e.g., Malaysian"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.parentInfo.fatherPhoneNumber"
                  type="tel"
                  placeholder="+60123456789"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.parentInfo.fatherEmail"
                  type="email"
                  placeholder="email@example.com"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Address <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="form.parentInfo.fatherAddress"
                  rows="3"
                  placeholder="Enter father's current address"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Actions -->
        <div class="px-4 py-3 bg-gray-50 flex justify-between sm:px-6 rounded-b-lg">
          <button
            type="button"
            @click="previousStep"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            type="button"
            @click="nextStep"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Next
            <svg class="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 3: Child/Baby Information -->
      <div v-if="currentStep === 3" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6 space-y-6">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Child/Baby Information</h2>
            <p class="mt-2 text-sm text-gray-600">Please provide details from the birth certificate (Surat Beranak)</p>
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Full Name (as per birth certificate) <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.childInfo.fullName"
                type="text"
                placeholder="Enter child's full name"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.childInfo.dateOfBirth"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Time of Birth <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.childInfo.timeOfBirth"
                type="time"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Gender <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.childInfo.gender"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="">Select gender...</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Place of Birth <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.childInfo.placeOfBirth"
                type="text"
                placeholder="City/Town"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Hospital Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.childInfo.hospitalName"
                type="text"
                placeholder="Name of hospital or medical facility"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                State of Birth <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.childInfo.stateOfBirth"
                type="text"
                placeholder="e.g., Selangor, Johor"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Country of Birth <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.childInfo.countryOfBirth"
                type="text"
                placeholder="e.g., Malaysia, Singapore"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Birth Certificate Number <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.childInfo.birthCertificateNo"
                type="text"
                placeholder="e.g., A123456"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Birth Certificate Issue Date <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.childInfo.birthCertificateIssueDate"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Current Address <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.childInfo.currentAddress"
                rows="3"
                placeholder="Enter child's current residential address"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              ></textarea>
            </div>

            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Reason for Application <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.childInfo.reasonForApplication"
                rows="4"
                placeholder="Please describe the reason for this citizenship application..."
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">Provide detailed explanation for applying for citizenship</p>
            </div>
          </div>
        </div>

        <!-- Navigation Actions -->
        <div class="px-4 py-3 bg-gray-50 flex justify-between sm:px-6 rounded-b-lg">
          <button
            type="button"
            @click="previousStep"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            type="button"
            @click="nextStep"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Next
            <svg class="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 4: Review -->
      <div v-if="currentStep === 4" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6 space-y-6">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Review Application</h2>
            <p class="mt-2 text-sm text-gray-600">Please review all details before submitting</p>
          </div>

          <!-- Application Type -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-blue-900 mb-1">Application Type</h3>
            <p class="text-lg font-medium text-blue-800">
              {{ applicationTypes.find(t => t.value === form.type)?.label }}
            </p>
            <p class="text-sm text-blue-700">
              {{ applicationTypes.find(t => t.value === form.type)?.subtitle }}
            </p>
          </div>

          <!-- Mother's Information -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mother's Information
            </h3>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div>
                <dt class="text-xs font-medium text-gray-500">Full Name</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.motherName || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Identity Type</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.motherIdentityType === 'MYKAD' ? 'MyKad' : 'Passport' }}</dd>
              </div>
              <div v-if="form.parentInfo.motherIdentityType === 'MYKAD'">
                <dt class="text-xs font-medium text-gray-500">MyKad Number</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.motherIC || '-' }}</dd>
              </div>
              <div v-if="form.parentInfo.motherIdentityType === 'PASSPORT'">
                <dt class="text-xs font-medium text-gray-500">Passport Number</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.motherPassportNo || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Nationality</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.motherNationality || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Phone Number</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.motherPhoneNumber || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Email</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.motherEmail || '-' }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium text-gray-500">Address</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.motherAddress || '-' }}</dd>
              </div>
            </dl>
          </div>

          <!-- Father's Information -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Father's Information
            </h3>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div>
                <dt class="text-xs font-medium text-gray-500">Full Name</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.fatherName || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Identity Type</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.fatherIdentityType === 'MYKAD' ? 'MyKad' : 'Passport' }}</dd>
              </div>
              <div v-if="form.parentInfo.fatherIdentityType === 'MYKAD'">
                <dt class="text-xs font-medium text-gray-500">MyKad Number</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.fatherIC || '-' }}</dd>
              </div>
              <div v-if="form.parentInfo.fatherIdentityType === 'PASSPORT'">
                <dt class="text-xs font-medium text-gray-500">Passport Number</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.fatherPassportNo || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Nationality</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.fatherNationality || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Phone Number</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.fatherPhoneNumber || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Email</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.fatherEmail || '-' }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium text-gray-500">Address</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.fatherAddress || '-' }}</dd>
              </div>
            </dl>
          </div>

          <!-- Child Information -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Child Information
            </h3>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium text-gray-500">Full Name</dt>
                <dd class="mt-1 text-sm font-medium text-gray-900">{{ form.childInfo.fullName || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Date of Birth</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.dateOfBirth || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Time of Birth</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.timeOfBirth || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Gender</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.gender || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Place of Birth</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.placeOfBirth || '-' }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium text-gray-500">Hospital Name</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.hospitalName || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">State of Birth</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.stateOfBirth || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Country of Birth</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.countryOfBirth || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Birth Certificate Number</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.birthCertificateNo || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Birth Certificate Issue Date</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.birthCertificateIssueDate || '-' }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium text-gray-500">Current Address</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.currentAddress || '-' }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium text-gray-500">Reason for Application</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.reasonForApplication || '-' }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Final Actions -->
        <div class="px-4 py-3 bg-gray-50 flex justify-between sm:px-6 rounded-b-lg">
          <button
            type="button"
            @click="previousStep"
            :disabled="loading"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div class="flex gap-3">
            <button
              type="button"
              @click="handleSaveDraft"
              :disabled="loading"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Save as Draft
            </button>
            <button
              type="button"
              @click="handleSubmit"
              :disabled="loading"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Submitting...' : 'Submit Application' }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p class="text-center text-sm text-gray-600">
          © 2025 Sistem Pengurusan Kewarganegaraan (SPK) - Jabatan Pendaftaran Negara Malaysia
        </p>
      </div>
    </footer>
  </div>
</template>
