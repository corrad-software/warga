import type { ApplicationStatus, UserRole } from '../generated/prisma'

/**
 * Workflow transition rule definition
 */
export interface TransitionRule {
  from: ApplicationStatus
  to: ApplicationStatus
  allowedRoles: UserRole[]
  requiresDocuments?: boolean
  requiresBiometric?: boolean
  requiresPayment?: boolean
  autoTransitions?: ApplicationStatus[] // Statuses that can auto-transition after this
}

/**
 * Define all valid workflow transitions
 */
export const WORKFLOW_TRANSITIONS: TransitionRule[] = [
  // Applicant can submit draft
  {
    from: 'DRAFT',
    to: 'SUBMITTED',
    allowedRoles: ['PEMOHON', 'ADMIN']
  },

  // Officer starts reviewing submitted application
  {
    from: 'SUBMITTED',
    to: 'PENDING_REVIEW',
    allowedRoles: ['PEGAWAI_PENDAFTARAN', 'PEGAWAI_KONSUL', 'ADMIN']
  },

  // Officer verifies documents
  {
    from: 'PENDING_REVIEW',
    to: 'DOCUMENTS_VERIFIED',
    allowedRoles: ['PEGAWAI_PENDAFTARAN', 'PEGAWAI_KONSUL', 'ADMIN'],
    requiresDocuments: true
  },

  // After documents verified, pending biometric capture
  {
    from: 'DOCUMENTS_VERIFIED',
    to: 'PENDING_BIOMETRIC',
    allowedRoles: ['PEGAWAI_PENDAFTARAN', 'PEGAWAI_KONSUL', 'ADMIN']
  },

  // Biometric data captured
  {
    from: 'PENDING_BIOMETRIC',
    to: 'BIOMETRIC_CAPTURED',
    allowedRoles: ['PEGAWAI_KONSUL', 'ADMIN'],
    requiresBiometric: true
  },

  // After biometric, pending payment
  {
    from: 'BIOMETRIC_CAPTURED',
    to: 'PENDING_PAYMENT',
    allowedRoles: ['PEGAWAI_KONSUL', 'ADMIN']
  },

  // Payment completed (can be triggered by payment gateway or officer verification)
  {
    from: 'PENDING_PAYMENT',
    to: 'PAYMENT_COMPLETED',
    allowedRoles: ['PEMOHON', 'PEGAWAI_PENDAFTARAN', 'PEGAWAI_KONSUL', 'ADMIN'],
    requiresPayment: true
  },

  // After payment, under review by consular officer
  {
    from: 'PAYMENT_COMPLETED',
    to: 'UNDER_REVIEW',
    allowedRoles: ['PEGAWAI_KONSUL', 'ADMIN'],
    requiresPayment: true
  },

  // Consular officer approves
  {
    from: 'UNDER_REVIEW',
    to: 'APPROVED',
    allowedRoles: ['PEGAWAI_KONSUL', 'ADMIN']
  },

  // Consular officer rejects
  {
    from: 'UNDER_REVIEW',
    to: 'REJECTED',
    allowedRoles: ['PEGAWAI_KONSUL', 'ADMIN']
  },

  // Approved application pending oath (for oath-required applications)
  {
    from: 'APPROVED',
    to: 'PENDING_OATH',
    allowedRoles: ['PEGAWAI_KONSUL', 'ADMIN']
  },

  // Oath completed
  {
    from: 'PENDING_OATH',
    to: 'OATH_COMPLETED',
    allowedRoles: ['PEGAWAI_KONSUL', 'ADMIN']
  },

  // Certificate issued after oath (or directly after approval if no oath required)
  {
    from: 'APPROVED',
    to: 'CERTIFICATE_ISSUED',
    allowedRoles: ['PEGAWAI_PENDAFTARAN', 'ADMIN']
  },
  {
    from: 'OATH_COMPLETED',
    to: 'CERTIFICATE_ISSUED',
    allowedRoles: ['PEGAWAI_PENDAFTARAN', 'ADMIN']
  },

  // Final completion
  {
    from: 'CERTIFICATE_ISSUED',
    to: 'COMPLETED',
    allowedRoles: ['PEGAWAI_PENDAFTARAN', 'ADMIN']
  },

  // Allow going back to pending review from documents verified (for corrections)
  {
    from: 'DOCUMENTS_VERIFIED',
    to: 'PENDING_REVIEW',
    allowedRoles: ['PEGAWAI_KONSUL', 'ADMIN']
  },

  // Allow requesting document resubmission
  {
    from: 'PENDING_REVIEW',
    to: 'SUBMITTED',
    allowedRoles: ['PEGAWAI_PENDAFTARAN', 'PEGAWAI_KONSUL', 'ADMIN']
  }
]

/**
 * Get valid next statuses for a given current status and user role
 */
export function getValidTransitions(
  currentStatus: ApplicationStatus,
  userRole: UserRole
): ApplicationStatus[] {
  return WORKFLOW_TRANSITIONS
    .filter(rule =>
      rule.from === currentStatus &&
      rule.allowedRoles.includes(userRole)
    )
    .map(rule => rule.to)
}

/**
 * Check if a transition is valid
 */
export function isValidTransition(
  fromStatus: ApplicationStatus,
  toStatus: ApplicationStatus,
  userRole: UserRole
): boolean {
  return WORKFLOW_TRANSITIONS.some(
    rule =>
      rule.from === fromStatus &&
      rule.to === toStatus &&
      rule.allowedRoles.includes(userRole)
  )
}

/**
 * Get transition rule for a specific transition
 */
export function getTransitionRule(
  fromStatus: ApplicationStatus,
  toStatus: ApplicationStatus
): TransitionRule | undefined {
  return WORKFLOW_TRANSITIONS.find(
    rule => rule.from === fromStatus && rule.to === toStatus
  )
}

/**
 * Get all transitions from a specific status
 */
export function getTransitionsFromStatus(
  fromStatus: ApplicationStatus
): TransitionRule[] {
  return WORKFLOW_TRANSITIONS.filter(rule => rule.from === fromStatus)
}
