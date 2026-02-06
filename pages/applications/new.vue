<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { token } = useAuth()
const router = useRouter()

const currentStep = ref(1) // Step 1: Choose type, Step 2: Section A, Step 3: Section B, Step 4: Section C, Step 5: Section D, Step 6: Section E, Step 7: Section F, Step 8: Documents, Step 9: Review, Step 10: Payment
const expandedType = ref<string | null>(null) // Track which card is expanded
const selectedBorangBOption = ref('') // Track selected radio option
const dragOverField = ref<string | null>(null) // Track which upload field is being dragged over
const showPaymentModal = ref(false) // Track payment modal visibility

const form = ref({
  type: '',
  subType: '', // For Borang B sub-options (01 or 02)

  // Section A: Butir-butir mengenai pemohon (Applicant Details)
  applicantInfo: {
    photo: null as File | null,
    fullName: '',
    icNumber: '',
    residentialAddress: '',
    city: '',
    postcode: '',
    state: '',
    country: 'Malaysia',
    relationshipToChild: '', // FATHER, MOTHER, ADOPTIVE_FATHER, ADOPTIVE_MOTHER, GUARDIAN
    reasonIfNotBiologicalParent: ''
  },

  // Section B: Butir-butir orang yang hendak didaftarkan (Person to be Registered)
  childInfo: {
    fullName: '',
    icNumber: '',
    placeOfBirth: '',
    countryOfBirth: 'Malaysia',
    dateOfBirth: '',
    race: '', // MALAY, CHINESE, INDIAN, OTHERS
    raceOthers: '',
    religion: '', // ISLAM, BUDDHA, HINDU, CHRISTIAN, OTHERS
    religionOthers: '',
    // Fields for those born outside Malaysia
    firstArrivalDate: '',
    placeOfArrival: '',
    passportNumber: '',
    passportIssuingCountry: '',
    countryOfResidenceBeforeMalaysia: '',
    entryPermitNumber: '',
    // Education records
    educationRecords: [
      {
        certificateName: '',
        periodFrom: '',
        periodTo: '',
        qualificationLevel: ''
      }
    ],
    // Employment information (if any)
    occupation: '',
    isSelfEmployed: false,
    businessType: '',
    employerName: '',
    employerAddress: '',
    // Other citizenship information
    hasOtherCitizenship: '',
    otherCitizenshipCountry: '',
    otherCitizenshipDateObtained: '',
    otherCitizenshipMethod: '',
    // Previous Malaysian citizenship application
    hasPreviousApplication: '',
    previousApplicationPlace: '',
    previousApplicationDate: '',
    previousApplicationStatus: '',
    hasGovernmentApprovalLetter: '',
    // Section C: Criminal and detention records
    hasConviction: '',
    hasDetention: '',
    criminalRecords: [
      {
        offense: '',
        fineAmount: '',
        detentionStartDate: '',
        detentionEndDate: '',
        country: ''
      }
    ]
  },

  // Section D: Parent Information
  parentInfo: {
    // Mother Information
    mother: {
      name: '',
      race: '',
      countryOfBirth: '',
      icNumber: '',
      currentCitizenship: '',
      citizenshipObtainedDate: '',
      citizenshipCertificateNumber: '',
      citizenshipAtChildBirth: '',
      placeOfResidence: ''
    },
    // Father Information
    father: {
      name: '',
      race: '',
      countryOfBirth: '',
      icNumber: '',
      currentCitizenship: '',
      citizenshipObtainedDate: '',
      citizenshipCertificateNumber: '',
      citizenshipAtChildBirth: '',
      placeOfResidence: ''
    },
    // Shared Information
    marriageDate: '',
    marriagePlace: ''
  },

  // Section E: Sibling Information
  siblingInfo: [],

  // Section F: Special Circumstances Application
  specialCircumstances: {
    reason: ''
  },

  // Documents
  documents: {
    applicantIcFront: null as File | null,
    applicantIcBack: null as File | null,
    childBirthCertificate: null as File | null,
    childEntryPermit: null as File | null,
    childTravelDocument: null as File | null,
    siblingsBirthCertificate: null as File | null,
    childIc: null as File | null,
    parentsCitizenshipCertificate: null as File | null,
    marriageCertificate: null as File | null,
    custodyCourtOrder: null as File | null,
    governmentApprovalLetter: null as File | null
  },

  // Acknowledgement
  acknowledgement: {
    confirmRelationship: false,
    confirmTruthfulness: false
  }
})

const loading = ref(false)
const error = ref('')
const success = ref(false)
const photoPreviewUrl = ref<string | null>(null)
const selectedApplicationType = ref<string | null>(null)

// List of countries
const countries = [
  'Malaysia',
  'Singapore',
  'Indonesia',
  'Thailand',
  'Brunei',
  'Philippines',
  'Vietnam',
  'Myanmar',
  'Cambodia',
  'Laos',
  'China',
  'India',
  'Bangladesh',
  'Pakistan',
  'Sri Lanka',
  'Japan',
  'South Korea',
  'Taiwan',
  'Hong Kong',
  'Australia',
  'New Zealand',
  'United Kingdom',
  'United States',
  'Canada',
  'Saudi Arabia',
  'United Arab Emirates',
  'Qatar',
  'Kuwait',
  'Other'
]

const applicationTypes = [
  {
    value: 'BORANG_A',
    label: 'Borang A',
    subtitle: 'Pendaftaran',
    description: 'Permohonan Bagi Kewarganegaraan Malaysia Melalui Pendaftaran',
    icon: 'document',
    enabled: true,
    estimatedDays: '90-120 hari'
  },
  {
    value: 'BORANG_B',
    label: 'Borang B',
    subtitle: 'Di Bawah Umur 18 Tahun',
    description: 'Permohonan Bagi Kewarganegaraan Malaysia Melalui Pendaftaran Bagi Orang Yang Di Bawah Umur 18 Tahun',
    icon: 'users',
    enabled: true,
    estimatedDays: '90-120 hari'
  },
  {
    value: 'BORANG_C',
    label: 'Borang C',
    subtitle: 'Penaturalisasian',
    description: 'Permohonan Bagi Kewarganegaraan Malaysia Melalui Penaturalisasian',
    icon: 'document',
    enabled: true,
    estimatedDays: '120-180 hari'
  },
  {
    value: 'BORANG_D',
    label: 'Borang D',
    subtitle: 'Lahir Di Luar Persekutuan',
    description: 'Permohonan Bagi Kewarganegaraan Malaysia Melalui Kuat Kuasa Undang-Undang Bagi Orang Yang Lahir Di Luar Persekutuan',
    icon: 'globe',
    enabled: true,
    estimatedDays: '90-120 hari'
  },
  {
    value: 'BORANG_E',
    label: 'Borang E',
    subtitle: 'Perakuan Kewarganegaraan',
    description: 'Permohonan Bagi Perakuan Kewarganegaraan Dan Pengesahan Taraf Kewarganegaraan Malaysia',
    icon: 'document',
    enabled: true,
    estimatedDays: '30-60 hari'
  },
  {
    value: 'BORANG_F',
    label: 'Borang F',
    subtitle: 'Mengekalkan Kewarganegaraan',
    description: 'Permohonan Bagi Mengekalkan Kewarganegaraan Malaysia',
    icon: 'document',
    enabled: true,
    estimatedDays: '60-90 hari'
  },
  {
    value: 'BORANG_O',
    label: 'Borang O',
    subtitle: 'Carian Dalam Rekod',
    description: 'Permohonan Bagi Carian Dalam Rekod Kewarganegaraan',
    icon: 'document',
    enabled: true,
    estimatedDays: '14-30 hari'
  },
  {
    value: 'BORANG_P',
    label: 'Borang P',
    subtitle: 'Penggantian Perakuan',
    description: 'Permohonan Bagi Penggantian Perakuan Kewarganegaraan (Sijil)',
    icon: 'document',
    enabled: true,
    estimatedDays: '30-60 hari'
  },
  {
    value: 'BORANG_Q',
    label: 'Borang Q',
    subtitle: 'Perakuan Kewarganegaraan',
    description: 'Permohonan Bagi Perakuan Kewarganegaraan',
    icon: 'document',
    enabled: true,
    estimatedDays: '30-60 hari'
  }
]

const borangBOptions = [
  {
    value: '01',
    label: 'Opsyen 01',
    title: 'Pendaftaran - Ibubapa Warganegara',
    description: 'Permohonan bagi pendaftaran sebagai warganegara Malaysia oleh seorang dibawah umur 21 tahun yang sekurang-kurangnya salah seorang daripada ibubapanya (atau pada masa kematian) adalah warganegara.'
  },
  {
    value: '02',
    label: 'Opsyen 02',
    title: 'Pendaftaran - Keadaan Khas',
    description: 'Permohonan bagi pendaftaran sebagai warganegara Malaysia oleh seorang dibawah umur 21 tahun dalam keadaan khas.'
  }
]

const selectApplicationType = (type: string, enabled: boolean) => {
  if (!enabled) return
  selectedApplicationType.value = type
}

const proceedToNextStep = () => {
  if (!selectedApplicationType.value) return
  form.value.type = selectedApplicationType.value
  currentStep.value = 2
}

const selectBorangBOption = () => {
  if (!selectedBorangBOption.value) return
  form.value.subType = selectedBorangBOption.value
  expandedType.value = null
  currentStep.value = 2
}

const backToSelection = () => {
  currentStep.value = 1
}

const nextStep = () => {
  if (currentStep.value < 10) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const goToStep = (step: number) => {
  if (step >= 1 && step <= 10) {
    currentStep.value = step
  }
}

const handlePayment = async () => {
  loading.value = true
  error.value = ''

  try {
    // Simulate payment processing
    // In a real implementation, this would integrate with a payment gateway like:
    // - FPX (Malaysian online banking)
    // - Stripe, Razorpay, etc. for cards
    // - Touch 'n Go eWallet, GrabPay, etc.

    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call

    // Mock payment success
    const paymentSuccess = true

    if (paymentSuccess) {
      // Close the payment modal
      showPaymentModal.value = false

      // Submit the application after successful payment
      await handleSubmit()
    } else {
      throw new Error('Pembayaran gagal. Sila cuba lagi.')
    }
  } catch (err: any) {
    error.value = err.message || 'Pembayaran gagal. Sila cuba lagi.'
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!form.value.type) {
    error.value = 'Sila pilih jenis permohonan'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Construct the final type value
    let finalType = form.value.type
    if (form.value.type === 'BORANG_B' && form.value.subType) {
      finalType = `BORANG_B_${form.value.subType}`
    }

    const response = await $fetch('/api/applications', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        type: finalType,
        formData: {
          applicantInfo: form.value.applicantInfo,
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
    error.value = err.data?.message || 'Gagal membuat permohonan'
  } finally {
    loading.value = false
  }
}

const handleSaveDraft = async () => {
  await handleSubmit()
}

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    form.value.applicantInfo.photo = file
    // Create preview URL
    photoPreviewUrl.value = URL.createObjectURL(file)
  }
}

const addEducationRecord = () => {
  form.value.childInfo.educationRecords.push({
    certificateName: '',
    periodFrom: '',
    periodTo: '',
    qualificationLevel: ''
  })
}

const removeEducationRecord = (index: number) => {
  if (form.value.childInfo.educationRecords.length > 1) {
    form.value.childInfo.educationRecords.splice(index, 1)
  }
}

const addCriminalRecord = () => {
  form.value.childInfo.criminalRecords.push({
    offense: '',
    fineAmount: '',
    detentionStartDate: '',
    detentionEndDate: '',
    country: ''
  })
}

const removeCriminalRecord = (index: number) => {
  if (form.value.childInfo.criminalRecords.length > 1) {
    form.value.childInfo.criminalRecords.splice(index, 1)
  }
}

const addSibling = () => {
  form.value.siblingInfo.push({
    name: '',
    gender: '',
    citizenship: '',
    countryOfBirth: '',
    countryOfResidence: ''
  })
}

const removeSibling = (index: number) => {
  form.value.siblingInfo.splice(index, 1)
}

const handleDocumentUpload = (event: Event, documentField: string) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/gif']

    if (file.size > maxSize) {
      alert('Fail terlalu besar. Maksimum 2MB.')
      target.value = ''
      return
    }

    if (!allowedTypes.includes(file.type)) {
      alert('Jenis fail tidak dibenarkan. Hanya PDF, PNG, JPG, dan GIF sahaja.')
      target.value = ''
      return
    }

    // @ts-ignore
    form.value.documents[documentField] = file
  }
}

const removeDocument = (documentField: string) => {
  // @ts-ignore
  form.value.documents[documentField] = null
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return '📄'
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return '🖼️'
  return '📎'
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const handleDragOver = (event: DragEvent, documentField: string) => {
  event.preventDefault()
  dragOverField.value = documentField
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  dragOverField.value = null
}

const handleDrop = (event: DragEvent, documentField: string) => {
  event.preventDefault()
  dragOverField.value = null

  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0]
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/gif']

    if (file.size > maxSize) {
      alert('Fail terlalu besar. Maksimum 2MB.')
      return
    }

    if (!allowedTypes.includes(file.type)) {
      alert('Jenis fail tidak dibenarkan. Hanya PDF, PNG, JPG, dan GIF sahaja.')
      return
    }

    // @ts-ignore
    form.value.documents[documentField] = file
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="mb-6" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <NuxtLink to="/dashboard" class="hover:text-gray-700">
              Dashboard
            </NuxtLink>
          </li>
          <li>
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </li>
          <li>
            <NuxtLink to="/dashboard" class="hover:text-gray-700">
              Permohonan
            </NuxtLink>
          </li>
          <li>
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </li>
          <li class="text-gray-900 font-medium">
            Permohonan Baharu
          </li>
        </ol>
      </nav>

      <!-- Page Title Card -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-3xl font-bold text-gray-900">Permohonan Kewarganegaraan Baharu</h2>
            <p class="text-gray-600 mt-2">Hantar permohonan kewarganegaraan baharu</p>
          </div>
          <button
            @click="router.push('/dashboard')"
            class="text-gray-400 hover:text-gray-600"
            title="Kembali"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Step Indicator -->
      <nav aria-label="Progress" class="mb-16">
        <ol class="flex items-center justify-center">
          <!-- Step 1 -->
          <li class="relative pr-8 sm:pr-12">
            <div class="absolute left-5 right-0 top-5 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full" :class="currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'"></div>
            </div>
            <div class="relative flex flex-col items-center cursor-pointer group" @click="goToStep(1)">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full transition-transform group-hover:scale-110"
                :class="currentStep >= 1 ? 'bg-blue-600 group-hover:bg-blue-700' : 'bg-gray-200 group-hover:bg-gray-300'"
              >
                <svg v-if="currentStep > 1" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span v-else class="text-white font-semibold">1</span>
              </div>
              <span class="mt-2 text-xs font-medium whitespace-nowrap text-center" :class="currentStep >= 1 ? 'text-blue-600 group-hover:text-blue-700' : 'text-gray-500 group-hover:text-gray-600'">
                Pilih Jenis
              </span>
            </div>
          </li>

          <!-- Step 2 -->
          <li class="relative pr-8 sm:pr-12">
            <div class="absolute left-5 right-0 top-5 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full" :class="currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'"></div>
            </div>
            <div class="relative flex flex-col items-center cursor-pointer group" @click="goToStep(2)">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full transition-transform group-hover:scale-110"
                :class="currentStep >= 2 ? 'bg-blue-600 group-hover:bg-blue-700' : 'bg-gray-200 group-hover:bg-gray-300'"
              >
                <svg v-if="currentStep > 2" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span v-else class="text-white font-semibold">2</span>
              </div>
              <span class="mt-2 text-xs font-medium whitespace-nowrap text-center" :class="currentStep >= 2 ? 'text-blue-600 group-hover:text-blue-700' : 'text-gray-500 group-hover:text-gray-600'">
                Seksyen A
              </span>
            </div>
          </li>

          <!-- Step 3 -->
          <li class="relative pr-8 sm:pr-12">
            <div class="absolute left-5 right-0 top-5 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full" :class="currentStep >= 4 ? 'bg-blue-600' : 'bg-gray-200'"></div>
            </div>
            <div class="relative flex flex-col items-center cursor-pointer group" @click="goToStep(3)">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full transition-transform group-hover:scale-110"
                :class="currentStep >= 3 ? 'bg-blue-600 group-hover:bg-blue-700' : 'bg-gray-200 group-hover:bg-gray-300'"
              >
                <svg v-if="currentStep > 3" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span v-else class="text-white font-semibold">3</span>
              </div>
              <span class="mt-2 text-xs font-medium whitespace-nowrap text-center" :class="currentStep >= 3 ? 'text-blue-600 group-hover:text-blue-700' : 'text-gray-500 group-hover:text-gray-600'">
                Seksyen B
              </span>
            </div>
          </li>

          <!-- Step 4 -->
          <li class="relative pr-8 sm:pr-12">
            <div class="absolute left-5 right-0 top-5 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full" :class="currentStep >= 5 ? 'bg-blue-600' : 'bg-gray-200'"></div>
            </div>
            <div class="relative flex flex-col items-center cursor-pointer group" @click="goToStep(4)">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full transition-transform group-hover:scale-110"
                :class="currentStep >= 4 ? 'bg-blue-600 group-hover:bg-blue-700' : 'bg-gray-200 group-hover:bg-gray-300'"
              >
                <svg v-if="currentStep > 4" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span v-else class="text-white font-semibold">4</span>
              </div>
              <span class="mt-2 text-xs font-medium whitespace-nowrap text-center" :class="currentStep >= 4 ? 'text-blue-600 group-hover:text-blue-700' : 'text-gray-500 group-hover:text-gray-600'">
                Seksyen C
              </span>
            </div>
          </li>

          <!-- Step 5 -->
          <li class="relative pr-8 sm:pr-12">
            <div class="absolute left-5 right-0 top-5 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full" :class="currentStep >= 6 ? 'bg-blue-600' : 'bg-gray-200'"></div>
            </div>
            <div class="relative flex flex-col items-center cursor-pointer group" @click="goToStep(5)">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full transition-transform group-hover:scale-110"
                :class="currentStep >= 5 ? 'bg-blue-600 group-hover:bg-blue-700' : 'bg-gray-200 group-hover:bg-gray-300'"
              >
                <svg v-if="currentStep > 5" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span v-else class="text-white font-semibold">5</span>
              </div>
              <span class="mt-2 text-xs font-medium whitespace-nowrap text-center" :class="currentStep >= 5 ? 'text-blue-600 group-hover:text-blue-700' : 'text-gray-500 group-hover:text-gray-600'">
                Seksyen D
              </span>
            </div>
          </li>

          <!-- Step 6 -->
          <li class="relative pr-8 sm:pr-12">
            <div class="absolute left-5 right-0 top-5 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full" :class="currentStep >= 7 ? 'bg-blue-600' : 'bg-gray-200'"></div>
            </div>
            <div class="relative flex flex-col items-center cursor-pointer group" @click="goToStep(6)">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full transition-transform group-hover:scale-110"
                :class="currentStep >= 6 ? 'bg-blue-600 group-hover:bg-blue-700' : 'bg-gray-200 group-hover:bg-gray-300'"
              >
                <svg v-if="currentStep > 6" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span v-else class="text-white font-semibold">6</span>
              </div>
              <span class="mt-2 text-xs font-medium whitespace-nowrap text-center" :class="currentStep >= 6 ? 'text-blue-600 group-hover:text-blue-700' : 'text-gray-500 group-hover:text-gray-600'">
                Seksyen E
              </span>
            </div>
          </li>

          <!-- Step 7 -->
          <li class="relative pr-8 sm:pr-12">
            <div class="absolute left-5 right-0 top-5 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full" :class="currentStep >= 8 ? 'bg-blue-600' : 'bg-gray-200'"></div>
            </div>
            <div class="relative flex flex-col items-center cursor-pointer group" @click="goToStep(7)">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full transition-transform group-hover:scale-110"
                :class="currentStep >= 7 ? 'bg-blue-600 group-hover:bg-blue-700' : 'bg-gray-200 group-hover:bg-gray-300'"
              >
                <svg v-if="currentStep > 7" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span v-else class="text-white font-semibold">7</span>
              </div>
              <span class="mt-2 text-xs font-medium whitespace-nowrap text-center" :class="currentStep >= 7 ? 'text-blue-600 group-hover:text-blue-700' : 'text-gray-500 group-hover:text-gray-600'">
                Seksyen F
              </span>
            </div>
          </li>

          <!-- Step 8 -->
          <li class="relative pr-8 sm:pr-12">
            <div class="absolute left-5 right-0 top-5 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full" :class="currentStep >= 9 ? 'bg-blue-600' : 'bg-gray-200'"></div>
            </div>
            <div class="relative flex flex-col items-center cursor-pointer group" @click="goToStep(8)">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full transition-transform group-hover:scale-110"
                :class="currentStep >= 8 ? 'bg-blue-600 group-hover:bg-blue-700' : 'bg-gray-200 group-hover:bg-gray-300'"
              >
                <svg v-if="currentStep > 8" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span v-else class="text-white font-semibold">8</span>
              </div>
              <span class="mt-2 text-xs font-medium whitespace-nowrap text-center" :class="currentStep >= 8 ? 'text-blue-600 group-hover:text-blue-700' : 'text-gray-500 group-hover:text-gray-600'">
                Dokumen
              </span>
            </div>
          </li>

          <!-- Step 9 (Review) -->
          <li class="relative pr-8 sm:pr-12">
            <div class="absolute left-5 right-0 top-5 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full" :class="currentStep >= 10 ? 'bg-blue-600' : 'bg-gray-200'"></div>
            </div>
            <div class="relative flex flex-col items-center cursor-pointer group" @click="goToStep(9)">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full transition-transform group-hover:scale-110"
                :class="currentStep >= 9 ? 'bg-blue-600 group-hover:bg-blue-700' : 'bg-gray-200 group-hover:bg-gray-300'"
              >
                <svg v-if="currentStep > 9" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span v-else class="text-white font-semibold">9</span>
              </div>
              <span class="mt-2 text-xs font-medium whitespace-nowrap text-center" :class="currentStep >= 9 ? 'text-blue-600 group-hover:text-blue-700' : 'text-gray-500 group-hover:text-gray-600'">
                Semak
              </span>
            </div>
          </li>

          <!-- Step 10 (Payment) -->
          <li class="relative">
            <div class="relative flex flex-col items-center cursor-pointer group" @click="goToStep(10)">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full transition-transform group-hover:scale-110"
                :class="currentStep >= 10 ? 'bg-blue-600 group-hover:bg-blue-700' : 'bg-gray-200 group-hover:bg-gray-300'"
              >
                <span class="text-white font-semibold">10</span>
              </div>
              <span class="mt-2 text-xs font-medium whitespace-nowrap text-center" :class="currentStep >= 10 ? 'text-blue-600 group-hover:text-blue-700' : 'text-gray-500 group-hover:text-gray-600'">
                Bayaran
              </span>
            </div>
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
        <!-- 4-Column Thumbnail Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <label
            v-for="type in applicationTypes"
            :key="type.value"
            class="relative bg-white rounded-lg shadow-md border-2 transition-all duration-200 flex flex-col min-h-[280px]"
            :class="[
              type.enabled ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed opacity-50 bg-gray-50',
              selectedApplicationType === type.value ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-blue-300'
            ]"
          >
            <input
              type="radio"
              :value="type.value"
              v-model="selectedApplicationType"
              :disabled="!type.enabled"
              class="sr-only"
            />

            <div class="p-6 flex flex-col flex-1">
              <!-- Radio Indicator -->
              <div class="absolute top-4 right-4">
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                  :class="selectedApplicationType === type.value
                    ? 'border-blue-500 bg-blue-500'
                    : type.enabled ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100'">
                  <div v-if="selectedApplicationType === type.value" class="w-2 h-2 rounded-full bg-white"></div>
                </div>
              </div>

              <!-- Icon -->
              <div class="flex items-center justify-center w-16 h-16 rounded-xl mx-auto mb-4"
                :class="selectedApplicationType === type.value
                  ? 'bg-blue-500'
                  : type.enabled ? 'bg-blue-100' : 'bg-gray-200'">
                <!-- Rocket Icon for Borang G -->
                <svg v-if="type.icon === 'rocket'" class="w-8 h-8" :class="selectedApplicationType === type.value ? 'text-white' : type.enabled ? 'text-blue-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <!-- Users Icon for Borang B -->
                <svg v-else-if="type.icon === 'users'" class="w-8 h-8" :class="selectedApplicationType === type.value ? 'text-white' : type.enabled ? 'text-blue-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <!-- Globe Icon for Borang H -->
                <svg v-else-if="type.icon === 'globe'" class="w-8 h-8" :class="selectedApplicationType === type.value ? 'text-white' : type.enabled ? 'text-blue-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <!-- Document Icon for Tadbir Sumpah -->
                <svg v-else class="w-8 h-8" :class="selectedApplicationType === type.value ? 'text-white' : type.enabled ? 'text-blue-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <!-- Borang Name -->
              <h3 class="text-lg font-bold text-center mb-2" :class="type.enabled ? 'text-gray-900' : 'text-gray-500'">
                {{ type.label }}
              </h3>

              <!-- Full Description -->
              <p class="text-[0.85rem] leading-[1.3rem] text-center mb-4 flex-1" :class="type.enabled ? 'text-gray-600' : 'text-gray-400'">
                {{ type.description }}
              </p>

              <!-- Coming Soon Badge or Estimated Time -->
              <div class="text-center mt-auto">
                <span v-if="type.comingSoon" class="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-700">
                  Coming Soon
                </span>
                <div v-else class="flex items-center justify-center text-xs text-gray-500">
                  <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ type.estimatedDays }}</span>
                </div>
              </div>
            </div>
          </label>
        </div>

        <!-- Next Button -->
        <div class="flex justify-center">
          <button
            @click="proceedToNextStep"
            :disabled="!selectedApplicationType"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Seterusnya
            <svg class="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 2: Section A - Butir-butir mengenai pemohon -->
      <div v-if="currentStep === 2" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6 space-y-6">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Seksyen A - Butir-butir mengenai pemohon</h2>
            <p class="mt-2 text-sm text-gray-600">Sila isi maklumat pemohon</p>
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <!-- Photo Upload -->
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Muatnaik Gambar <span class="text-red-500">*</span>
              </label>
              <div class="flex items-start gap-4">
                <!-- Preview Area -->
                <div class="relative">
                  <div class="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                    <img
                      v-if="photoPreviewUrl"
                      :src="photoPreviewUrl"
                      alt="Photo preview"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="text-center p-4">
                      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p class="mt-1 text-xs text-gray-500">Preview</p>
                    </div>
                  </div>
                </div>

                <!-- Upload Button -->
                <div class="flex-1">
                  <label class="cursor-pointer">
                    <div class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Pilih Gambar
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      @change="handlePhotoUpload"
                      class="hidden"
                    />
                  </label>
                  <p class="mt-2 text-xs text-gray-500">
                    Format: JPG, PNG atau GIF. Maksimum 5MB.
                  </p>
                  <p v-if="form.applicantInfo.photo" class="mt-1 text-xs text-green-600">
                    ✓ {{ form.applicantInfo.photo.name }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Full Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nama Penuh <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.applicantInfo.fullName"
                type="text"
                placeholder="Masukkan nama penuh"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <!-- IC Number -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                No. Kad Pengenalan <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.applicantInfo.icNumber"
                type="text"
                placeholder="cth: 901234-56-7890"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <!-- Residential Address -->
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Alamat Kediaman <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.applicantInfo.residentialAddress"
                rows="3"
                placeholder="Masukkan alamat kediaman"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              ></textarea>
            </div>

            <!-- City -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Bandar <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.applicantInfo.city"
                type="text"
                placeholder="Masukkan bandar"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <!-- Postcode -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Poskod <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.applicantInfo.postcode"
                type="text"
                placeholder="cth: 50000"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <!-- State -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Negeri <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.applicantInfo.state"
                type="text"
                placeholder="cth: Selangor"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <!-- Country -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Negara <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.applicantInfo.country"
                type="text"
                placeholder="cth: Malaysia"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <!-- Relationship to Child -->
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Pertalian antara pemohon dengan orang yang hendak didaftarkan <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.applicantInfo.relationshipToChild"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="">Sila pilih...</option>
                <option value="FATHER">Bapa</option>
                <option value="MOTHER">Ibu</option>
                <option value="ADOPTIVE_FATHER">Bapa Angkat</option>
                <option value="ADOPTIVE_MOTHER">Ibu Angkat</option>
                <option value="GUARDIAN">Penjaga</option>
              </select>
            </div>

            <!-- Reason if not biological parent -->
            <div v-if="form.applicantInfo.relationshipToChild && !['FATHER', 'MOTHER'].includes(form.applicantInfo.relationshipToChild)" class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Jika pemohon bukan ibubapa sebenar orang yang hendak didaftarkan, berikan sebab <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.applicantInfo.reasonIfNotBiologicalParent"
                rows="4"
                placeholder="Masukkan sebab..."
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              ></textarea>
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
            Kembali
          </button>
          <button
            type="button"
            @click="nextStep"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Seterusnya
            <svg class="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 3: Section B - Butir-butir orang yang hendak didaftarkan -->
      <div v-if="currentStep === 3" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6 space-y-6">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Seksyen B - Butir-butir orang yang hendak didaftarkan</h2>
            <p class="mt-2 text-sm text-gray-600">Sila isi maklumat orang yang hendak didaftarkan</p>
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <!-- Full Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nama Penuh <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.childInfo.fullName"
                type="text"
                placeholder="Masukkan nama penuh"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <!-- IC Number -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                No. Kad Pengenalan <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.childInfo.icNumber"
                type="text"
                placeholder="cth: 901234-56-7890"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <!-- Place of Birth -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tempat Lahir <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.childInfo.placeOfBirth"
                type="text"
                placeholder="cth: Hospital Kuala Lumpur"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <!-- Country of Birth -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Negara Lahir <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.childInfo.countryOfBirth"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option v-for="country in countries" :key="country" :value="country">
                  {{ country }}
                </option>
              </select>
            </div>

            <!-- Date of Birth -->
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tarikh Lahir <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.childInfo.dateOfBirth"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <!-- Conditional: If born outside Malaysia -->
            <div v-if="form.childInfo.countryOfBirth && form.childInfo.countryOfBirth.toLowerCase() !== 'malaysia'" class="sm:col-span-2">
              <div class="border-t border-gray-200 pt-6 mt-2">
                <h4 class="text-sm font-semibold text-gray-900 mb-4">Jika lahir diluar Malaysia, berikan butir-butir</h4>

                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <!-- First Arrival Date -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Hari Ketibaan Pertama <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.childInfo.firstArrivalDate"
                      type="date"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <!-- Place of Arrival -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Tempat Ketibaan <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.childInfo.placeOfArrival"
                      type="text"
                      placeholder="cth: KLIA"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <!-- Passport Number -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      No. Pasport <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.childInfo.passportNumber"
                      type="text"
                      placeholder="cth: A12345678"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <!-- Passport Issuing Country -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Negara yang Keluarkan Pasport <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="form.childInfo.passportIssuingCountry"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Sila pilih...</option>
                      <option v-for="country in countries" :key="country" :value="country">
                        {{ country }}
                      </option>
                    </select>
                  </div>

                  <!-- Country of Residence Before Malaysia -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Negara Bermastautin Sebelum Tiba di Malaysia <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="form.childInfo.countryOfResidenceBeforeMalaysia"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Sila pilih...</option>
                      <option v-for="country in countries" :key="country" :value="country">
                        {{ country }}
                      </option>
                    </select>
                  </div>

                  <!-- Entry Permit Number -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nombor Permit Masuk <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.childInfo.entryPermitNumber"
                      type="text"
                      placeholder="Masukkan nombor permit"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Race -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Bangsa <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.childInfo.race"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="">Sila pilih...</option>
                <option value="MELAYU">Melayu</option>
                <option value="CINA">Cina</option>
                <option value="INDIA">India</option>
                <option value="LAIN_LAIN">Lain-lain</option>
              </select>
            </div>

            <!-- Race Others -->
            <div v-if="form.childInfo.race === 'LAIN_LAIN'">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nyatakan Bangsa Lain <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.childInfo.raceOthers"
                type="text"
                placeholder="Nyatakan bangsa..."
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <!-- Religion -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Agama <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.childInfo.religion"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="">Sila pilih...</option>
                <option value="ISLAM">Islam</option>
                <option value="BUDDHA">Buddha</option>
                <option value="HINDU">Hindu</option>
                <option value="KRISTIAN">Kristian</option>
                <option value="LAIN_LAIN">Lain-lain</option>
              </select>
            </div>

            <!-- Religion Others -->
            <div v-if="form.childInfo.religion === 'LAIN_LAIN'">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nyatakan Agama Lain <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.childInfo.religionOthers"
                type="text"
                placeholder="Nyatakan agama..."
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <!-- Education Records Section -->
          <div class="border-t border-gray-200 pt-6 mt-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Butir-butir mengenai Pendidikan</h3>
              <button
                type="button"
                @click="addEducationRecord"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Tambah Rekod
              </button>
            </div>

            <!-- Education Records List -->
            <div class="space-y-6">
              <div
                v-for="(record, index) in form.childInfo.educationRecords"
                :key="index"
                class="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-sm font-semibold text-gray-900">Rekod Pendidikan {{ index + 1 }}</h4>
                  <button
                    v-if="form.childInfo.educationRecords.length > 1"
                    type="button"
                    @click="removeEducationRecord(index)"
                    class="text-red-600 hover:text-red-800 transition-colors"
                    title="Padam rekod"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <!-- Certificate Name -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nama Sijil <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="record.certificateName"
                      type="text"
                      placeholder="cth: SPM, Diploma, Ijazah Sarjana Muda"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <!-- Qualification Level -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Peringkat Kelulusan <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="record.qualificationLevel"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Sila pilih...</option>
                      <option value="SEKOLAH_RENDAH">Sekolah Rendah</option>
                      <option value="PMR">PMR/PT3</option>
                      <option value="SPM">SPM</option>
                      <option value="STPM">STPM</option>
                      <option value="DIPLOMA">Diploma</option>
                      <option value="IJAZAH_SARJANA_MUDA">Ijazah Sarjana Muda</option>
                      <option value="IJAZAH_SARJANA">Ijazah Sarjana</option>
                      <option value="IJAZAH_KEDOKTORAN">Ijazah Kedoktoran (PhD)</option>
                      <option value="LAIN_LAIN">Lain-lain</option>
                    </select>
                  </div>

                  <!-- Period From -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Tahun/Tempoh Dari <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="record.periodFrom"
                      type="date"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <!-- Period To -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Hingga <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="record.periodTo"
                      type="date"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Employment Information Section -->
          <div class="border-t border-gray-200 pt-6 mt-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-1">Pekerjaan yang hendak didaftarkan</h3>
            <p class="text-sm text-gray-600 mb-4">(Jika ada)</p>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <!-- Occupation -->
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Pekerjaan
                </label>
                <input
                  v-model="form.childInfo.occupation"
                  type="text"
                  placeholder="cth: Guru, Jurutera, Doktor"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <!-- Self-employed checkbox -->
              <div class="sm:col-span-2">
                <label class="flex items-center cursor-pointer">
                  <input
                    v-model="form.childInfo.isSelfEmployed"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm font-medium text-gray-700">Bekerja Sendiri</span>
                </label>
              </div>

              <!-- Business Type (shown if self-employed) -->
              <div v-if="form.childInfo.isSelfEmployed" class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Perniagaan/Profesion
                </label>
                <input
                  v-model="form.childInfo.businessType"
                  type="text"
                  placeholder="cth: Peruncit, Perunding IT, Peguam"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <!-- Employer Name (shown if NOT self-employed) -->
              <div v-if="!form.childInfo.isSelfEmployed && form.childInfo.occupation" class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nama Majikan
                </label>
                <input
                  v-model="form.childInfo.employerName"
                  type="text"
                  placeholder="Masukkan nama majikan"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <!-- Employer Address (shown if NOT self-employed) -->
              <div v-if="!form.childInfo.isSelfEmployed && form.childInfo.occupation" class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Majikan
                </label>
                <textarea
                  v-model="form.childInfo.employerAddress"
                  rows="3"
                  placeholder="Masukkan alamat majikan"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Other Citizenship Section -->
          <div class="border-t border-gray-200 pt-6 mt-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Kewarganegaraan Lain</h3>

            <div class="space-y-6">
              <!-- Has Other Citizenship Question -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Adakah anda memegang kewarganegaraan mana-mana negara? <span class="text-red-500">*</span>
                </label>
                <div class="flex gap-6">
                  <label class="flex items-center cursor-pointer">
                    <input
                      v-model="form.childInfo.hasOtherCitizenship"
                      type="radio"
                      value="YA"
                      required
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span class="ml-2 text-sm text-gray-700">Ya</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input
                      v-model="form.childInfo.hasOtherCitizenship"
                      type="radio"
                      value="TIDAK"
                      required
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span class="ml-2 text-sm text-gray-700">Tidak</span>
                  </label>
                </div>
              </div>

              <!-- Conditional fields if YES -->
              <div v-if="form.childInfo.hasOtherCitizenship === 'YA'" class="grid grid-cols-1 gap-6 sm:grid-cols-2 pl-6 border-l-2 border-blue-200">
                <!-- Country Name -->
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nama Negara <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="form.childInfo.otherCitizenshipCountry"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Sila pilih...</option>
                    <option v-for="country in countries" :key="country" :value="country">
                      {{ country }}
                    </option>
                  </select>
                </div>

                <!-- Date Obtained -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tarikh Diperolehi <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.childInfo.otherCitizenshipDateObtained"
                    type="date"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Method of Obtaining -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Cara Diperolehi <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="form.childInfo.otherCitizenshipMethod"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Sila pilih...</option>
                    <option value="KELAHIRAN">Melalui Kelahiran</option>
                    <option value="KETURUNAN">Melalui Keturunan</option>
                    <option value="NATURALISASI">Naturalisasi</option>
                    <option value="PERKAHWINAN">Melalui Perkahwinan</option>
                    <option value="PENDAFTARAN">Melalui Pendaftaran</option>
                    <option value="LAIN_LAIN">Lain-lain</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Previous Malaysian Citizenship Application Section -->
          <div class="border-t border-gray-200 pt-6 mt-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Permohonan Kewarganegaraan Terdahulu</h3>

            <div class="space-y-6">
              <!-- Has Previous Application Question -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Pernahkah anda sebelum ini memohon untuk diberikan kewarganegaraan Malaysia? <span class="text-red-500">*</span>
                </label>
                <div class="flex gap-6">
                  <label class="flex items-center cursor-pointer">
                    <input
                      v-model="form.childInfo.hasPreviousApplication"
                      type="radio"
                      value="YA"
                      required
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span class="ml-2 text-sm text-gray-700">Ya</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input
                      v-model="form.childInfo.hasPreviousApplication"
                      type="radio"
                      value="TIDAK"
                      required
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span class="ml-2 text-sm text-gray-700">Tidak</span>
                  </label>
                </div>
              </div>

              <!-- Conditional fields if YES -->
              <div v-if="form.childInfo.hasPreviousApplication === 'YA'" class="grid grid-cols-1 gap-6 sm:grid-cols-2 pl-6 border-l-2 border-blue-200">
                <!-- Place of Application -->
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tempat Permohonan <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.childInfo.previousApplicationPlace"
                    type="text"
                    placeholder="cth: Jabatan Pendaftaran Negara Kuala Lumpur"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Date of Application -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tarikh Permohonan <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.childInfo.previousApplicationDate"
                    type="date"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Application Status -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Adakah permohonan ditolak/ditangguh? <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="form.childInfo.previousApplicationStatus"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Sila pilih...</option>
                    <option value="DITOLAK">Ditolak</option>
                    <option value="DITANGGUH">Ditangguh</option>
                    <option value="DALAM_PROSES">Dalam Proses</option>
                    <option value="LAIN_LAIN">Lain-lain</option>
                  </select>
                </div>

                <!-- Government Approval Letter -->
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    Sudahkah anda mendapatkan surat kelulusan dari Kerajaan Persekutuan bagi permohonan ini? <span class="text-red-500">*</span>
                  </label>
                  <div class="flex gap-6">
                    <label class="flex items-center cursor-pointer">
                      <input
                        v-model="form.childInfo.hasGovernmentApprovalLetter"
                        type="radio"
                        value="YA"
                        required
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span class="ml-2 text-sm text-gray-700">Ya</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                      <input
                        v-model="form.childInfo.hasGovernmentApprovalLetter"
                        type="radio"
                        value="TIDAK"
                        required
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span class="ml-2 text-sm text-gray-700">Tidak</span>
                    </label>
                  </div>
                </div>
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
            Kembali
          </button>
          <button
            type="button"
            @click="nextStep"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Seterusnya
            <svg class="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 4: Section C - Criminal and Detention Records -->
      <div v-if="currentStep === 4" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6 space-y-6">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Seksyen C - Rekod Jenayah dan Tahanan</h2>
            <p class="mt-2 text-sm text-gray-600">Sila isi maklumat berkaitan rekod jenayah dan tahanan (jika ada)</p>
          </div>

          <div class="space-y-6">
            <!-- Has Conviction Question -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Pernahkah orang yang hendak didaftarkan disabitkan dengan apa atau didapati bersalah atas apa-apa kesalahan? <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-6">
                <label class="flex items-center cursor-pointer">
                  <input
                    v-model="form.childInfo.hasConviction"
                    type="radio"
                    value="YA"
                    required
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">Ya</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input
                    v-model="form.childInfo.hasConviction"
                    type="radio"
                    value="TIDAK"
                    required
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">Tidak</span>
                </label>
              </div>
            </div>

            <!-- Has Detention Question -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Pernahkah orang yang hendak didaftarkan dikurung di dalam penjara atau di dalam institusi psikiatrik melalui perintah mahkamah? <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-6">
                <label class="flex items-center cursor-pointer">
                  <input
                    v-model="form.childInfo.hasDetention"
                    type="radio"
                    value="YA"
                    required
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">Ya</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input
                    v-model="form.childInfo.hasDetention"
                    type="radio"
                    value="TIDAK"
                    required
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">Tidak</span>
                </label>
              </div>
            </div>

            <!-- Conditional Criminal Records if either answer is YES -->
            <div v-if="form.childInfo.hasConviction === 'YA' || form.childInfo.hasDetention === 'YA'" class="pl-6 border-l-2 border-blue-200">
              <div class="flex items-center justify-between mb-4">
                <p class="text-sm font-medium text-gray-700">Jika jawapan adalah ya bagi kedua-dua soalan diatas, berikan butir</p>
                <button
                  type="button"
                  @click="addCriminalRecord"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg class="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Rekod
                </button>
              </div>

              <!-- Criminal Records List -->
              <div class="space-y-6">
                <div
                  v-for="(record, index) in form.childInfo.criminalRecords"
                  :key="index"
                  class="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="text-sm font-semibold text-gray-900">Rekod Jenayah {{ index + 1 }}</h4>
                    <button
                      v-if="form.childInfo.criminalRecords.length > 1"
                      type="button"
                      @click="removeCriminalRecord(index)"
                      class="text-red-600 hover:text-red-800 transition-colors"
                      title="Padam rekod"
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <!-- Offense -->
                    <div class="sm:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Kesalahan <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="record.offense"
                        type="text"
                        placeholder="Masukkan jenis kesalahan"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <!-- Fine Amount -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Amaun Didenda <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="record.fineAmount"
                        type="text"
                        placeholder="cth: RM 5,000"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <!-- Country -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Negara <span class="text-red-500">*</span>
                      </label>
                      <select
                        v-model="record.country"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Sila pilih...</option>
                        <option v-for="country in countries" :key="country" :value="country">
                          {{ country }}
                        </option>
                      </select>
                    </div>

                    <!-- Detention Start Date -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Tempoh Tahanan (Dari) <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="record.detentionStartDate"
                        type="date"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <!-- Detention End Date -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Tempoh Tahanan (Hingga) <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="record.detentionEndDate"
                        type="date"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
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
            Kembali
          </button>
          <button
            type="button"
            @click="nextStep"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Seterusnya
            <svg class="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 5: Section D - Parent Information -->
      <div v-if="currentStep === 5" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6 space-y-6">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Seksyen D - Maklumat mengenai Ibu dan Bapa</h2>
            <p class="mt-2 text-sm text-gray-600">Sila isi maklumat ibu dan bapa</p>
          </div>

          <div class="space-y-8">
            <!-- Mother Information -->
            <div class="border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg class="w-5 h-5 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Maklumat Ibu
              </h3>

              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <!-- Mother Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nama <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.parentInfo.mother.name"
                    type="text"
                    placeholder="Masukkan nama penuh ibu"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Mother IC Number -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    No. Kad Pengenalan (jika ada)
                  </label>
                  <input
                    v-model="form.parentInfo.mother.icNumber"
                    type="text"
                    placeholder="cth: 901234-56-7890"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Mother Race -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Bangsa <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.parentInfo.mother.race"
                    type="text"
                    placeholder="cth: Melayu, Cina, India"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Mother Country of Birth -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Negara Kelahiran <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="form.parentInfo.mother.countryOfBirth"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Sila pilih...</option>
                    <option v-for="country in countries" :key="country" :value="country">
                      {{ country }}
                    </option>
                  </select>
                </div>

                <!-- Mother Current Citizenship -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Kewarganegaraan Sekarang atau Kewarganegaraan Semasa Kematian <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.parentInfo.mother.currentCitizenship"
                    type="text"
                    placeholder="cth: Warganegara Malaysia"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Mother Citizenship Obtained Date -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tarikh Kewarganegaraan Diperolehi
                  </label>
                  <input
                    v-model="form.parentInfo.mother.citizenshipObtainedDate"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Mother Citizenship Certificate Number -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    No. Sijil Kewarganegaraan
                  </label>
                  <input
                    v-model="form.parentInfo.mother.citizenshipCertificateNumber"
                    type="text"
                    placeholder="Masukkan nombor sijil"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Mother Citizenship at Child Birth -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Kewarganegaraan Semasa Kelahiran Orang yang Hendak Diluluskan <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.parentInfo.mother.citizenshipAtChildBirth"
                    type="text"
                    placeholder="cth: Warganegara Malaysia"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Mother Place of Residence -->
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tempat Bermastautin <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    v-model="form.parentInfo.mother.placeOfResidence"
                    rows="3"
                    placeholder="Masukkan alamat penuh"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Father Information -->
            <div class="border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Maklumat Bapa
              </h3>

              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <!-- Father Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nama <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.parentInfo.father.name"
                    type="text"
                    placeholder="Masukkan nama penuh bapa"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Father IC Number -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    No. Kad Pengenalan (jika ada)
                  </label>
                  <input
                    v-model="form.parentInfo.father.icNumber"
                    type="text"
                    placeholder="cth: 901234-56-7890"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Father Race -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Bangsa <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.parentInfo.father.race"
                    type="text"
                    placeholder="cth: Melayu, Cina, India"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Father Country of Birth -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Negara Kelahiran <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="form.parentInfo.father.countryOfBirth"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Sila pilih...</option>
                    <option v-for="country in countries" :key="country" :value="country">
                      {{ country }}
                    </option>
                  </select>
                </div>

                <!-- Father Current Citizenship -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Kewarganegaraan Sekarang atau Kewarganegaraan Semasa Kematian <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.parentInfo.father.currentCitizenship"
                    type="text"
                    placeholder="cth: Warganegara Malaysia"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Father Citizenship Obtained Date -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tarikh Kewarganegaraan Diperolehi
                  </label>
                  <input
                    v-model="form.parentInfo.father.citizenshipObtainedDate"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Father Citizenship Certificate Number -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    No. Sijil Kewarganegaraan
                  </label>
                  <input
                    v-model="form.parentInfo.father.citizenshipCertificateNumber"
                    type="text"
                    placeholder="Masukkan nombor sijil"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Father Citizenship at Child Birth -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Kewarganegaraan Semasa Kelahiran Orang yang Hendak Diluluskan <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.parentInfo.father.citizenshipAtChildBirth"
                    type="text"
                    placeholder="cth: Warganegara Malaysia"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Father Place of Residence -->
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tempat Bermastautin <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    v-model="form.parentInfo.father.placeOfResidence"
                    rows="3"
                    placeholder="Masukkan alamat penuh"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Marriage Information (Shared) -->
            <div class="border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg class="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Maklumat Perkahwinan
              </h3>

              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <!-- Marriage Date -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tarikh Perkahwinan <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.parentInfo.marriageDate"
                    type="date"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Marriage Place -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tempat Perkahwinan <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.parentInfo.marriagePlace"
                    type="text"
                    placeholder="cth: Kuala Lumpur, Malaysia"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
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
            Kembali
          </button>
          <button
            type="button"
            @click="nextStep"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Seterusnya
            <svg class="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 6: Section E - Sibling Information -->
      <div v-if="currentStep === 6" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6 space-y-6">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Seksyen E - Maklumat mengenai Adik Beradik</h2>
            <p class="mt-2 text-sm text-gray-600">Sila isi maklumat adik beradik</p>
          </div>

          <div class="space-y-6">
            <!-- Sibling Records -->
            <div
              v-for="(sibling, index) in form.siblingInfo"
              :key="index"
              class="border border-gray-200 rounded-lg p-6"
            >
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Adik Beradik {{ index + 1 }}
                </h3>
                <button
                  type="button"
                  @click="removeSibling(index)"
                  class="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Padam
                </button>
              </div>

              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <!-- Name -->
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nama <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="sibling.name"
                    type="text"
                    placeholder="Masukkan nama penuh"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Gender -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Jantina <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="sibling.gender"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Sila pilih...</option>
                    <option value="LELAKI">Lelaki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>

                <!-- Citizenship -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Kewarganegaraan <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="sibling.citizenship"
                    type="text"
                    placeholder="cth: Warganegara Malaysia"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <!-- Country of Birth -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Negara Kelahiran <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="sibling.countryOfBirth"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Sila pilih...</option>
                    <option v-for="country in countries" :key="country" :value="country">
                      {{ country }}
                    </option>
                  </select>
                </div>

                <!-- Country of Residence -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Negara Mastautin <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="sibling.countryOfResidence"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Sila pilih...</option>
                    <option v-for="country in countries" :key="country" :value="country">
                      {{ country }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Add Sibling Button -->
            <button
              type="button"
              @click="addSibling"
              class="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Tambah Adik Beradik
            </button>
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
            Kembali
          </button>
          <button
            type="button"
            @click="nextStep"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Seterusnya
            <svg class="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 7: Section F - Special Circumstances Application -->
      <div v-if="currentStep === 7" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6 space-y-6">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Seksyen F - Permohonan di bawah Keadaan Khas</h2>
            <p class="mt-2 text-sm text-gray-600">Sila isi maklumat jika berkenaan</p>
          </div>

          <div class="border border-gray-200 rounded-lg p-6">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Jika permohonan sijil kewarganegaraan dibuat dibawah perkara 15A Perlembagaan Persekutuan, nyatakan sebab.
              </label>
              <textarea
                v-model="form.specialCircumstances.reason"
                rows="6"
                placeholder="Nyatakan sebab permohonan di bawah keadaan khas (jika berkenaan)..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              ></textarea>
              <p class="mt-2 text-xs text-gray-500">
                Medan ini adalah pilihan. Isi hanya jika permohonan anda dibuat di bawah perkara 15A Perlembagaan Persekutuan.
              </p>
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
            Kembali
          </button>
          <button
            type="button"
            @click="nextStep"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Seterusnya
            <svg class="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 8: Documents -->
      <div v-if="currentStep === 8" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6 space-y-8">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Dokumen</h2>
            <p class="mt-2 text-sm text-gray-600">Sila muat naik dokumen yang diperlukan (Asal & Fotostat Satu Salinan)<br/>PDF, PNG, JPG, GIF sahaja, maksimum 2MB setiap fail</p>
          </div>

          <!-- Section 1: DOKUMEN ORANG YANG HENDAK DIDAFTARKAN -->
          <div class="space-y-6">
            <div class="border-b border-gray-200 pb-3">
              <h3 class="text-lg font-semibold text-gray-900">1. DOKUMEN ORANG YANG HENDAK DIDAFTARKAN</h3>
              <p class="text-xs text-gray-500 mt-1">(Asal & Fotostat Satu Salinan)</p>
            </div>

            <!-- a) Kad Pengenalan (Jika ada) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                a) Kad Pengenalan (Jika ada)
              </label>

              <!-- Upload area when no file -->
              <div v-if="!form.documents.personIc" class="relative">
                <label
                  class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all"
                  :class="dragOverField === 'personIc' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'"
                  @dragover="(e) => handleDragOver(e, 'personIc')"
                  @dragleave="handleDragLeave"
                  @drop="(e) => handleDrop(e, 'personIc')"
                >
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg class="w-10 h-10 mb-3" :class="dragOverField === 'personIc' ? 'text-blue-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p class="mb-2 text-sm" :class="dragOverField === 'personIc' ? 'text-blue-700' : 'text-gray-500'">
                      <span class="font-semibold">{{ dragOverField === 'personIc' ? 'Lepaskan fail di sini' : 'Klik atau seret fail ke sini' }}</span>
                    </p>
                    <p class="text-xs text-gray-400">PDF, PNG, JPG, GIF (Max 2MB)</p>
                  </div>
                  <input
                    type="file"
                    class="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.gif"
                    @change="(e) => handleDocumentUpload(e, 'personIc')"
                  />
                </label>
              </div>

              <!-- File preview when uploaded -->
              <div v-else class="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div class="flex items-center space-x-3 flex-1 min-w-0">
                  <span class="text-2xl">{{ getFileIcon(form.documents.personIc.name) }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ form.documents.personIc.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(form.documents.personIc.size) }}</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeDocument('personIc')"
                  class="ml-3 flex-shrink-0 p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                  title="Padam fail"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- b) Sijil Kelahiran / Sijil Anak Angkat -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                b) Sijil Kelahiran / Sijil Anak Angkat <span class="text-red-500">*</span>
              </label>
              <p class="text-xs text-gray-500 mb-3">Jika lahir di luar negara, sediakan terjemahan dalam bahasa Melayu atau Inggeris oleh Mahkamah / Konsulat / Penterjemah Awam.</p>

              <!-- Upload area when no file -->
              <div v-if="!form.documents.personBirthCertificate" class="relative">
                <label
                  class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all"
                  :class="dragOverField === 'personBirthCertificate' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'"
                  @dragover="(e) => handleDragOver(e, 'personBirthCertificate')"
                  @dragleave="handleDragLeave"
                  @drop="(e) => handleDrop(e, 'personBirthCertificate')"
                >
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg class="w-10 h-10 mb-3" :class="dragOverField === 'personBirthCertificate' ? 'text-blue-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p class="mb-2 text-sm" :class="dragOverField === 'personBirthCertificate' ? 'text-blue-700' : 'text-gray-500'">
                      <span class="font-semibold">{{ dragOverField === 'personBirthCertificate' ? 'Lepaskan fail di sini' : 'Klik atau seret fail ke sini' }}</span> <span class="text-red-500">*</span>
                    </p>
                    <p class="text-xs text-gray-400">PDF, PNG, JPG, GIF (Max 2MB)</p>
                  </div>
                  <input
                    type="file"
                    class="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.gif"
                    @change="(e) => handleDocumentUpload(e, 'personBirthCertificate')"
                    required
                  />
                </label>
              </div>

              <!-- File preview when uploaded -->
              <div v-else class="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div class="flex items-center space-x-3 flex-1 min-w-0">
                  <span class="text-2xl">{{ getFileIcon(form.documents.personBirthCertificate.name) }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ form.documents.personBirthCertificate.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(form.documents.personBirthCertificate.size) }}</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeDocument('personBirthCertificate')"
                  class="ml-3 flex-shrink-0 p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                  title="Padam fail"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- c) Permit Masuk (Jika ada) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                c) Permit Masuk (Jika ada)
              </label>

              <!-- Upload area when no file -->
              <div v-if="!form.documents.personEntryPermit" class="relative">
                <label
                  class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all"
                  :class="dragOverField === 'personEntryPermit' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'"
                  @dragover="(e) => handleDragOver(e, 'personEntryPermit')"
                  @dragleave="handleDragLeave"
                  @drop="(e) => handleDrop(e, 'personEntryPermit')"
                >
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg class="w-10 h-10 mb-3" :class="dragOverField === 'personEntryPermit' ? 'text-blue-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p class="mb-2 text-sm" :class="dragOverField === 'personEntryPermit' ? 'text-blue-700' : 'text-gray-500'">
                      <span class="font-semibold">{{ dragOverField === 'personEntryPermit' ? 'Lepaskan fail di sini' : 'Klik atau seret fail ke sini' }}</span>
                    </p>
                    <p class="text-xs text-gray-400">PDF, PNG, JPG, GIF (Max 2MB)</p>
                  </div>
                  <input
                    type="file"
                    class="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.gif"
                    @change="(e) => handleDocumentUpload(e, 'personEntryPermit')"
                  />
                </label>
              </div>

              <!-- File preview when uploaded -->
              <div v-else class="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div class="flex items-center space-x-3 flex-1 min-w-0">
                  <span class="text-2xl">{{ getFileIcon(form.documents.personEntryPermit.name) }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ form.documents.personEntryPermit.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(form.documents.personEntryPermit.size) }}</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeDocument('personEntryPermit')"
                  class="ml-3 flex-shrink-0 p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                  title="Padam fail"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- d) Passport Perjalanan (Jika ada) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                d) Passport Perjalanan (Jika ada)
              </label>

              <!-- Upload area when no file -->
              <div v-if="!form.documents.personPassport" class="relative">
                <label
                  class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all"
                  :class="dragOverField === 'personPassport' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'"
                  @dragover="(e) => handleDragOver(e, 'personPassport')"
                  @dragleave="handleDragLeave"
                  @drop="(e) => handleDrop(e, 'personPassport')"
                >
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg class="w-10 h-10 mb-3" :class="dragOverField === 'personPassport' ? 'text-blue-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p class="mb-2 text-sm" :class="dragOverField === 'personPassport' ? 'text-blue-700' : 'text-gray-500'">
                      <span class="font-semibold">{{ dragOverField === 'personPassport' ? 'Lepaskan fail di sini' : 'Klik atau seret fail ke sini' }}</span>
                    </p>
                    <p class="text-xs text-gray-400">PDF, PNG, JPG, GIF (Max 2MB)</p>
                  </div>
                  <input
                    type="file"
                    class="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.gif"
                    @change="(e) => handleDocumentUpload(e, 'personPassport')"
                  />
                </label>
              </div>

              <!-- File preview when uploaded -->
              <div v-else class="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div class="flex items-center space-x-3 flex-1 min-w-0">
                  <span class="text-2xl">{{ getFileIcon(form.documents.personPassport.name) }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ form.documents.personPassport.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(form.documents.personPassport.size) }}</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeDocument('personPassport')"
                  class="ml-3 flex-shrink-0 p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                  title="Padam fail"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- e) Dokumen bukti persekolahan subjek (Jika bersekolah) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                e) Dokumen bukti persekolahan subjek (Jika bersekolah)
              </label>

              <!-- Upload area when no file -->
              <div v-if="!form.documents.personSchoolProof" class="relative">
                <label
                  class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all"
                  :class="dragOverField === 'personSchoolProof' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'"
                  @dragover="(e) => handleDragOver(e, 'personSchoolProof')"
                  @dragleave="handleDragLeave"
                  @drop="(e) => handleDrop(e, 'personSchoolProof')"
                >
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg class="w-10 h-10 mb-3" :class="dragOverField === 'personSchoolProof' ? 'text-blue-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p class="mb-2 text-sm" :class="dragOverField === 'personSchoolProof' ? 'text-blue-700' : 'text-gray-500'">
                      <span class="font-semibold">{{ dragOverField === 'personSchoolProof' ? 'Lepaskan fail di sini' : 'Klik atau seret fail ke sini' }}</span>
                    </p>
                    <p class="text-xs text-gray-400">PDF, PNG, JPG, GIF (Max 2MB)</p>
                  </div>
                  <input
                    type="file"
                    class="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.gif"
                    @change="(e) => handleDocumentUpload(e, 'personSchoolProof')"
                  />
                </label>
              </div>

              <!-- File preview when uploaded -->
              <div v-else class="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div class="flex items-center space-x-3 flex-1 min-w-0">
                  <span class="text-2xl">{{ getFileIcon(form.documents.personSchoolProof.name) }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ form.documents.personSchoolProof.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(form.documents.personSchoolProof.size) }}</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeDocument('personSchoolProof')"
                  class="ml-3 flex-shrink-0 p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                  title="Padam fail"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- f) Note about special circumstances -->
            <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p class="text-xs text-blue-800">
                <span class="font-medium">f)</span> Nyatakan sebab mohon warganegara dalam keadaan khas di ruangan F dalam borang permohonan.
              </p>
            </div>
          </div>

          <!-- Section 2: DOKUMEN PEMOHON IBU / BAPA -->
          <div class="space-y-6">
            <div class="border-b border-gray-200 pb-3">
              <h3 class="text-lg font-semibold text-gray-900">2. DOKUMEN PEMOHON IBU / BAPA</h3>
              <p class="text-xs text-gray-500 mt-1">(Asal & Fotostat Satu Salinan)</p>
            </div>

            <!-- a) Kad Pengenalan -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                a) Kad Pengenalan <span class="text-red-500">*</span>
              </label>

              <!-- Upload area when no file -->
              <div v-if="!form.documents.parentIc" class="relative">
                <label
                  class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all"
                  :class="dragOverField === 'parentIc' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'"
                  @dragover="(e) => handleDragOver(e, 'parentIc')"
                  @dragleave="handleDragLeave"
                  @drop="(e) => handleDrop(e, 'parentIc')"
                >
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg class="w-10 h-10 mb-3" :class="dragOverField === 'parentIc' ? 'text-blue-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p class="mb-2 text-sm" :class="dragOverField === 'parentIc' ? 'text-blue-700' : 'text-gray-500'">
                      <span class="font-semibold">{{ dragOverField === 'parentIc' ? 'Lepaskan fail di sini' : 'Klik atau seret fail ke sini' }}</span> <span class="text-red-500">*</span>
                    </p>
                    <p class="text-xs text-gray-400">PDF, PNG, JPG, GIF (Max 2MB)</p>
                  </div>
                  <input
                    type="file"
                    class="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.gif"
                    @change="(e) => handleDocumentUpload(e, 'parentIc')"
                    required
                  />
                </label>
              </div>

              <!-- File preview when uploaded -->
              <div v-else class="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div class="flex items-center space-x-3 flex-1 min-w-0">
                  <span class="text-2xl">{{ getFileIcon(form.documents.parentIc.name) }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ form.documents.parentIc.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(form.documents.parentIc.size) }}</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeDocument('parentIc')"
                  class="ml-3 flex-shrink-0 p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                  title="Padam fail"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- b) Sijil Kelahiran (Jika ada) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                b) Sijil Kelahiran (Jika ada)
              </label>

              <!-- Upload area when no file -->
              <div v-if="!form.documents.parentBirthCertificate" class="relative">
                <label
                  class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all"
                  :class="dragOverField === 'parentBirthCertificate' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'"
                  @dragover="(e) => handleDragOver(e, 'parentBirthCertificate')"
                  @dragleave="handleDragLeave"
                  @drop="(e) => handleDrop(e, 'parentBirthCertificate')"
                >
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg class="w-10 h-10 mb-3" :class="dragOverField === 'parentBirthCertificate' ? 'text-blue-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p class="mb-2 text-sm" :class="dragOverField === 'parentBirthCertificate' ? 'text-blue-700' : 'text-gray-500'">
                      <span class="font-semibold">{{ dragOverField === 'parentBirthCertificate' ? 'Lepaskan fail di sini' : 'Klik atau seret fail ke sini' }}</span>
                    </p>
                    <p class="text-xs text-gray-400">PDF, PNG, JPG, GIF (Max 2MB)</p>
                  </div>
                  <input
                    type="file"
                    class="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.gif"
                    @change="(e) => handleDocumentUpload(e, 'parentBirthCertificate')"
                  />
                </label>
              </div>

              <!-- File preview when uploaded -->
              <div v-else class="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div class="flex items-center space-x-3 flex-1 min-w-0">
                  <span class="text-2xl">{{ getFileIcon(form.documents.parentBirthCertificate.name) }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ form.documents.parentBirthCertificate.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(form.documents.parentBirthCertificate.size) }}</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeDocument('parentBirthCertificate')"
                  class="ml-3 flex-shrink-0 p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                  title="Padam fail"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- c) Sijil Warganegara (Jika ada) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                c) Sijil Warganegara (Jika ada)
              </label>

              <!-- Upload area when no file -->
              <div v-if="!form.documents.parentCitizenshipCertificate" class="relative">
                <label
                  class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all"
                  :class="dragOverField === 'parentCitizenshipCertificate' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'"
                  @dragover="(e) => handleDragOver(e, 'parentCitizenshipCertificate')"
                  @dragleave="handleDragLeave"
                  @drop="(e) => handleDrop(e, 'parentCitizenshipCertificate')"
                >
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg class="w-10 h-10 mb-3" :class="dragOverField === 'parentCitizenshipCertificate' ? 'text-blue-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p class="mb-2 text-sm" :class="dragOverField === 'parentCitizenshipCertificate' ? 'text-blue-700' : 'text-gray-500'">
                      <span class="font-semibold">{{ dragOverField === 'parentCitizenshipCertificate' ? 'Lepaskan fail di sini' : 'Klik atau seret fail ke sini' }}</span>
                    </p>
                    <p class="text-xs text-gray-400">PDF, PNG, JPG, GIF (Max 2MB)</p>
                  </div>
                  <input
                    type="file"
                    class="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.gif"
                    @change="(e) => handleDocumentUpload(e, 'parentCitizenshipCertificate')"
                  />
                </label>
              </div>

              <!-- File preview when uploaded -->
              <div v-else class="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div class="flex items-center space-x-3 flex-1 min-w-0">
                  <span class="text-2xl">{{ getFileIcon(form.documents.parentCitizenshipCertificate.name) }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ form.documents.parentCitizenshipCertificate.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(form.documents.parentCitizenshipCertificate.size) }}</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeDocument('parentCitizenshipCertificate')"
                  class="ml-3 flex-shrink-0 p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                  title="Padam fail"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- d) Sijil Nikah / Sijil Perkahwinan -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                d) Sijil Nikah / Sijil Perkahwinan <span class="text-red-500">*</span>
              </label>

              <!-- Upload area when no file -->
              <div v-if="!form.documents.parentMarriageCertificate" class="relative">
                <label
                  class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all"
                  :class="dragOverField === 'parentMarriageCertificate' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'"
                  @dragover="(e) => handleDragOver(e, 'parentMarriageCertificate')"
                  @dragleave="handleDragLeave"
                  @drop="(e) => handleDrop(e, 'parentMarriageCertificate')"
                >
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg class="w-10 h-10 mb-3" :class="dragOverField === 'parentMarriageCertificate' ? 'text-blue-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p class="mb-2 text-sm" :class="dragOverField === 'parentMarriageCertificate' ? 'text-blue-700' : 'text-gray-500'">
                      <span class="font-semibold">{{ dragOverField === 'parentMarriageCertificate' ? 'Lepaskan fail di sini' : 'Klik atau seret fail ke sini' }}</span> <span class="text-red-500">*</span>
                    </p>
                    <p class="text-xs text-gray-400">PDF, PNG, JPG, GIF (Max 2MB)</p>
                  </div>
                  <input
                    type="file"
                    class="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.gif"
                    @change="(e) => handleDocumentUpload(e, 'parentMarriageCertificate')"
                    required
                  />
                </label>
              </div>

              <!-- File preview when uploaded -->
              <div v-else class="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div class="flex items-center space-x-3 flex-1 min-w-0">
                  <span class="text-2xl">{{ getFileIcon(form.documents.parentMarriageCertificate.name) }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ form.documents.parentMarriageCertificate.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(form.documents.parentMarriageCertificate.size) }}</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeDocument('parentMarriageCertificate')"
                  class="ml-3 flex-shrink-0 p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                  title="Padam fail"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- e) Passport Perjalanan (Jika ada) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                e) Passport Perjalanan (Jika ada)
              </label>

              <!-- Upload area when no file -->
              <div v-if="!form.documents.parentPassport" class="relative">
                <label
                  class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all"
                  :class="dragOverField === 'parentPassport' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'"
                  @dragover="(e) => handleDragOver(e, 'parentPassport')"
                  @dragleave="handleDragLeave"
                  @drop="(e) => handleDrop(e, 'parentPassport')"
                >
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg class="w-10 h-10 mb-3" :class="dragOverField === 'parentPassport' ? 'text-blue-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p class="mb-2 text-sm" :class="dragOverField === 'parentPassport' ? 'text-blue-700' : 'text-gray-500'">
                      <span class="font-semibold">{{ dragOverField === 'parentPassport' ? 'Lepaskan fail di sini' : 'Klik atau seret fail ke sini' }}</span>
                    </p>
                    <p class="text-xs text-gray-400">PDF, PNG, JPG, GIF (Max 2MB)</p>
                  </div>
                  <input
                    type="file"
                    class="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.gif"
                    @change="(e) => handleDocumentUpload(e, 'parentPassport')"
                  />
                </label>
              </div>

              <!-- File preview when uploaded -->
              <div v-else class="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div class="flex items-center space-x-3 flex-1 min-w-0">
                  <span class="text-2xl">{{ getFileIcon(form.documents.parentPassport.name) }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ form.documents.parentPassport.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(form.documents.parentPassport.size) }}</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeDocument('parentPassport')"
                  class="ml-3 flex-shrink-0 p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                  title="Padam fail"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
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
            Kembali
          </button>
          <button
            type="button"
            @click="nextStep"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Seterusnya
            <svg class="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 9: Review -->
      <div v-if="currentStep === 9" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6 space-y-6">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Semak Permohonan</h2>
            <p class="mt-2 text-sm text-gray-600">Sila semak semua butiran sebelum menghantar</p>
          </div>

          <!-- Section A: Applicant Information -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Seksyen A - Butir-butir mengenai pemohon
            </h3>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium text-gray-500">Nama Penuh</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.applicantInfo.fullName || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">No. Kad Pengenalan</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.applicantInfo.icNumber || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Hubungan dengan Subjek</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.applicantInfo.relationshipToChild || '-' }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium text-gray-500">Alamat Kediaman</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ [form.applicantInfo.residentialAddress, form.applicantInfo.city, form.applicantInfo.postcode, form.applicantInfo.state, form.applicantInfo.country].filter(Boolean).join(', ') || '-' }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Section B: Person to be Registered -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Seksyen B - Butir-butir orang yang hendak didaftarkan
            </h3>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium text-gray-500">Nama Penuh</dt>
                <dd class="mt-1 text-sm font-medium text-gray-900">{{ form.childInfo.fullName || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Tarikh Lahir</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.dateOfBirth || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Tempat Lahir</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.placeOfBirth || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Negara Lahir</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.countryOfBirth || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Bangsa</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.race || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Agama</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.religion || '-' }}</dd>
              </div>
              <div v-if="form.childInfo.occupation">
                <dt class="text-xs font-medium text-gray-500">Pekerjaan</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.occupation }}</dd>
              </div>
            </dl>
          </div>

          <!-- Section C: Criminal and Detention Records -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Seksyen C - Rekod Jenayah dan Tahanan
            </h3>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div>
                <dt class="text-xs font-medium text-gray-500">Pernah Disabitkan Kesalahan</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.hasConviction || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Pernah Dikurung dalam Penjara/Institusi Psikiatrik</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ form.childInfo.hasDetention || '-' }}</dd>
              </div>
            </dl>
            <div v-if="(form.childInfo.hasConviction === 'YA' || form.childInfo.hasDetention === 'YA') && form.childInfo.criminalRecords?.length > 0" class="mt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Butir-butir Rekod:</h4>
              <div class="space-y-2">
                <div v-for="(record, index) in form.childInfo.criminalRecords" :key="index" class="bg-gray-50 rounded-lg p-3">
                  <p class="text-sm font-medium text-gray-900">{{ index + 1 }}. {{ record.offense || '-' }}</p>
                  <p class="text-xs text-gray-500">Denda: {{ record.fineAmount || '-' }} | Tarikh: {{ record.detentionStartDate || '-' }} hingga {{ record.detentionEndDate || '-' }} | Negara: {{ record.country || '-' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Section D: Parent Information -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Seksyen D - Maklumat mengenai Ibu dan Bapa
            </h3>

            <!-- Mother -->
            <div class="mb-4">
              <h4 class="text-sm font-semibold text-pink-600 mb-2">Ibu</h4>
              <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt class="text-xs font-medium text-gray-500">Nama</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.mother.name || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">Bangsa</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.mother.race || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">No. K/P</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.mother.icNumber || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">Kewarganegaraan Semasa</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.mother.currentCitizenship || '-' }}</dd>
                </div>
              </dl>
            </div>

            <!-- Father -->
            <div>
              <h4 class="text-sm font-semibold text-blue-600 mb-2">Bapa</h4>
              <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt class="text-xs font-medium text-gray-500">Nama</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.father.name || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">Bangsa</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.father.race || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">No. K/P</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.father.icNumber || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">Kewarganegaraan Semasa</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ form.parentInfo.father.currentCitizenship || '-' }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Section E: Siblings -->
          <div v-if="form.siblingInfo.length > 0" class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Seksyen E - Maklumat mengenai Adik Beradik
            </h3>
            <div class="space-y-3">
              <div v-for="(sibling, index) in form.siblingInfo" :key="index" class="bg-gray-50 rounded-lg p-3">
                <p class="text-sm font-medium text-gray-900">{{ index + 1 }}. {{ sibling.name }}</p>
                <p class="text-xs text-gray-500">{{ sibling.age }} tahun | {{ sibling.citizenship }}</p>
              </div>
            </div>
          </div>

          <!-- Section F: Special Circumstances -->
          <div v-if="form.specialCircumstances?.reason" class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Seksyen F - Permohonan di bawah Keadaan Khas
            </h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ form.specialCircumstances.reason }}</p>
            </div>
          </div>

          <!-- Documents -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Dokumen yang Dimuat Naik
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div v-if="form.documents.personIc" class="flex items-center space-x-2 text-sm">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Kad Pengenalan (Subjek)</span>
              </div>
              <div v-if="form.documents.personBirthCertificate" class="flex items-center space-x-2 text-sm">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Sijil Kelahiran</span>
              </div>
              <div v-if="form.documents.personEntryPermit" class="flex items-center space-x-2 text-sm">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Permit Masuk</span>
              </div>
              <div v-if="form.documents.personPassport" class="flex items-center space-x-2 text-sm">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Passport (Subjek)</span>
              </div>
              <div v-if="form.documents.personSchoolProof" class="flex items-center space-x-2 text-sm">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Bukti Persekolahan</span>
              </div>
              <div v-if="form.documents.parentIc" class="flex items-center space-x-2 text-sm">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Kad Pengenalan (Ibu Bapa)</span>
              </div>
              <div v-if="form.documents.parentBirthCertificate" class="flex items-center space-x-2 text-sm">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Sijil Kelahiran (Ibu Bapa)</span>
              </div>
              <div v-if="form.documents.parentCitizenshipCertificate" class="flex items-center space-x-2 text-sm">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Sijil Warganegara</span>
              </div>
              <div v-if="form.documents.parentMarriageCertificate" class="flex items-center space-x-2 text-sm">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Sijil Nikah/Perkahwinan</span>
              </div>
              <div v-if="form.documents.parentPassport" class="flex items-center space-x-2 text-sm">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Passport (Ibu Bapa)</span>
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
            Kembali
          </button>
          <button
            type="button"
            @click="nextStep"
            :disabled="!form.acknowledgement.confirmRelationship || !form.acknowledgement.confirmTruthfulness"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Seterusnya
            <svg class="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 10: Payment -->
      <div v-if="currentStep === 10" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6 space-y-6">
          <div class="text-center mb-6">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900">Bayaran Pemprosesan</h2>
            <p class="mt-2 text-sm text-gray-600">Sila buat bayaran untuk memproses permohonan anda</p>
          </div>

          <!-- Payment Details -->
          <div class="bg-gray-50 rounded-lg p-6 space-y-4">
            <div class="flex justify-between items-center pb-4 border-b border-gray-200">
              <span class="text-sm font-medium text-gray-700">Yuran Pemprosesan Permohonan Kewarganegaraan</span>
              <span class="text-lg font-bold text-gray-900">RM 10.00</span>
            </div>

            <div class="space-y-2 text-sm text-gray-600">
              <p>• Yuran ini adalah untuk memproses permohonan kewarganegaraan anda</p>
              <p>• Bayaran adalah tidak boleh dikembalikan</p>
              <p>• Resit pembayaran akan dihantar ke emel anda selepas pembayaran berjaya</p>
              <p>• Permohonan hanya akan diproses selepas pembayaran disahkan</p>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
              <div class="flex">
                <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="ml-3">
                  <p class="text-sm text-blue-800">
                    <strong>Penting:</strong> Pastikan maklumat permohonan anda adalah betul sebelum membuat bayaran. Bayaran yang telah dibuat tidak boleh dikembalikan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Amount -->
          <div class="bg-blue-600 rounded-lg p-6 text-white">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm opacity-90">Jumlah Bayaran</p>
                <p class="text-3xl font-bold">RM 10.00</p>
              </div>
              <button
                type="button"
                @click="showPaymentModal = true"
                class="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Bayar Sekarang
              </button>
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
        </div>
      </div>

      <!-- Payment Modal -->
      <div v-if="showPaymentModal" class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showPaymentModal = false"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Bayaran Permohonan
                  </h3>
                  <div class="mt-4 space-y-4">
                    <div class="bg-gray-50 rounded-md p-4">
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm text-gray-600">Jumlah Bayaran:</span>
                        <span class="text-xl font-bold text-gray-900">RM 10.00</span>
                      </div>
                    </div>

                    <div class="text-sm text-gray-500">
                      <p class="mb-2">Kaedah pembayaran yang diterima:</p>
                      <ul class="list-disc list-inside space-y-1">
                        <li>FPX (Online Banking)</li>
                        <li>Kad Kredit/Debit</li>
                        <li>E-Wallet</li>
                      </ul>
                    </div>

                    <div class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p class="text-xs text-yellow-800">
                        <strong>Nota:</strong> Anda akan diarahkan ke gateway pembayaran yang selamat. Sila jangan tutup tetingkap ini sehingga pembayaran selesai.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="button"
                @click="handlePayment"
                :disabled="loading"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? 'Memproses...' : 'Teruskan Pembayaran' }}
              </button>
              <button
                type="button"
                @click="showPaymentModal = false"
                :disabled="loading"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
