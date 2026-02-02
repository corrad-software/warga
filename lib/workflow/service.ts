import { prisma } from '../prisma'
import type { ApplicationStatus, UserRole } from '../generated/prisma'
import { getTransitionRule, isValidTransition } from './rules'

export interface TransitionOptions {
  applicationId: string
  toStatus: ApplicationStatus
  userId: string
  userRole: UserRole
  notes?: string
  metadata?: Record<string, any>
}

export interface TransitionResult {
  success: boolean
  application: any
  error?: string
}

/**
 * Validate transition requirements
 */
async function validateTransitionRequirements(
  applicationId: string,
  fromStatus: ApplicationStatus,
  toStatus: ApplicationStatus
): Promise<{ valid: boolean; error?: string }> {
  const rule = getTransitionRule(fromStatus, toStatus)

  if (!rule) {
    return { valid: true }
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      documents: true,
      payments: true,
      user: {
        include: {
          biometrics: true
        }
      }
    }
  })

  if (!application) {
    return { valid: false, error: 'Application not found' }
  }

  // Check if documents are required and verified
  if (rule.requiresDocuments) {
    const hasVerifiedDocuments = application.documents.some(
      doc => doc.verificationStatus === 'VERIFIED'
    )
    if (!hasVerifiedDocuments) {
      return {
        valid: false,
        error: 'At least one verified document is required for this transition'
      }
    }
  }

  // Check if biometric data is required
  if (rule.requiresBiometric) {
    const hasVerifiedBiometric = application.user.biometrics.some(
      bio => bio.isVerified
    )
    if (!hasVerifiedBiometric) {
      return {
        valid: false,
        error: 'Verified biometric data is required for this transition'
      }
    }
  }

  // Check if payment is required
  if (rule.requiresPayment) {
    const hasCompletedPayment = application.payments.some(
      payment => payment.status === 'COMPLETED'
    )
    if (!hasCompletedPayment) {
      return {
        valid: false,
        error: 'Payment completion is required for this transition'
      }
    }
  }

  return { valid: true }
}

/**
 * Execute a workflow transition
 */
export async function executeTransition(
  options: TransitionOptions
): Promise<TransitionResult> {
  const { applicationId, toStatus, userId, userRole, notes, metadata } = options

  try {
    // Get current application
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    })

    if (!application) {
      return {
        success: false,
        application: null,
        error: 'Application not found'
      }
    }

    const fromStatus = application.status

    // Check if already in target status
    if (fromStatus === toStatus) {
      return {
        success: false,
        application,
        error: 'Application is already in the target status'
      }
    }

    // Validate transition is allowed for this role
    if (!isValidTransition(fromStatus, toStatus, userRole)) {
      return {
        success: false,
        application,
        error: `Transition from ${fromStatus} to ${toStatus} is not allowed for your role`
      }
    }

    // Validate transition requirements
    const requirementCheck = await validateTransitionRequirements(
      applicationId,
      fromStatus,
      toStatus
    )

    if (!requirementCheck.valid) {
      return {
        success: false,
        application,
        error: requirementCheck.error
      }
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: toStatus,
        ...(toStatus === 'SUBMITTED' && { submissionDate: new Date() }),
        ...(toStatus === 'PENDING_REVIEW' && { reviewStartDate: new Date() }),
        ...((['APPROVED', 'REJECTED'].includes(toStatus)) && { decisionDate: new Date() }),
        ...(toStatus === 'COMPLETED' && { completionDate: new Date() })
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    })

    // Create workflow history
    await prisma.workflowHistory.create({
      data: {
        applicationId,
        fromStatus,
        toStatus,
        actionBy: userId,
        actionByRole: userRole,
        notes: notes || `Transitioned from ${fromStatus} to ${toStatus}`,
        metadata: metadata || {}
      }
    })

    return {
      success: true,
      application: updatedApplication
    }
  } catch (error: any) {
    console.error('Transition error:', error)
    return {
      success: false,
      application: null,
      error: error.message || 'Failed to execute transition'
    }
  }
}

/**
 * Approve an application
 */
export async function approveApplication(
  applicationId: string,
  userId: string,
  userRole: UserRole,
  decision?: string,
  decisionReason?: string
): Promise<TransitionResult> {
  try {
    // First, transition to APPROVED
    const result = await executeTransition({
      applicationId,
      toStatus: 'APPROVED',
      userId,
      userRole,
      notes: 'Application approved'
    })

    if (!result.success) {
      return result
    }

    // Update decision details
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        decision: decision || 'Approved',
        decisionReason: decisionReason || 'Application meets all requirements',
        consulatOfficerId: userId
      }
    })

    return result
  } catch (error: any) {
    return {
      success: false,
      application: null,
      error: error.message || 'Failed to approve application'
    }
  }
}

/**
 * Reject an application
 */
export async function rejectApplication(
  applicationId: string,
  userId: string,
  userRole: UserRole,
  decisionReason: string
): Promise<TransitionResult> {
  try {
    // First, transition to REJECTED
    const result = await executeTransition({
      applicationId,
      toStatus: 'REJECTED',
      userId,
      userRole,
      notes: 'Application rejected'
    })

    if (!result.success) {
      return result
    }

    // Update decision details
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        decision: 'Rejected',
        decisionReason,
        consulatOfficerId: userId
      }
    })

    return result
  } catch (error: any) {
    return {
      success: false,
      application: null,
      error: error.message || 'Failed to reject application'
    }
  }
}
