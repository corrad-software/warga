import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'
import { createAuditLog } from '~/lib/utils/audit'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)
    const userId = getRouterParam(event, 'id')
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'User ID is required'
      })
    }
    
    // Users can only update their own profile (except admins)
    if (currentUser.id !== userId && currentUser.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        message: 'Insufficient permissions'
      })
    }
    
    const body = await readBody(event)
    
    // Fields that can be updated by the user
    const allowedFields = [
      'name',
      'phoneNumber',
      'address',
      'dateOfBirth',
      'placeOfBirth',
      'icNumber',
      'passportNumber'
    ]
    
    // Extract only allowed fields
    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    
    // Admins can update additional fields
    if (currentUser.role === 'ADMIN') {
      if (body.role !== undefined) updateData.role = body.role
      if (body.isActive !== undefined) updateData.isActive = body.isActive
      if (body.nationalityStatus !== undefined) updateData.nationalityStatus = body.nationalityStatus
      if (body.biometricStatus !== undefined) updateData.biometricStatus = body.biometricStatus
    }
    
    // Get original user data for audit
    const originalUser = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        icNumber: true,
        passportNumber: true,
        phoneNumber: true,
        address: true,
        dateOfBirth: true,
        placeOfBirth: true,
        role: true,
        nationalityStatus: true,
        biometricStatus: true,
        isActive: true,
        emailVerified: true,
        updatedAt: true
      }
    })
    
    // Create audit log
    await createAuditLog({
      userId: currentUser.id,
      action: 'UPDATE',
      entityType: 'User',
      entityId: userId,
      changes: {
        before: originalUser,
        after: user
      },
      metadata: {
        updatedBy: currentUser.id,
        updatedFields: Object.keys(updateData)
      }
    })
    
    return {
      success: true,
      data: { user }
    }
  } catch (error: any) {
    console.error('Update user error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to update user'
    })
  }
})
